"use client";

// U2 — the ARS Navigator flight sim (Layer 1 / Three.js), MVP per
// specs/ARS-NAVIGATOR-FLIGHT-SIM-v1.md "Immediate Build Sequence" steps 3–4:
//   3. Three.js scene scaffold — nodes + arcs render, orbit camera
//   4. Layer slider — ontology depth filter  (ship MVP here)
//
// Data comes from the ARS gateway's /v1/graph/traverse feed (proxied at
// /api/graph/traverse) over the D0-seeded, OntologyLayer-tagged subject graphs.
// Layout is deterministic: OntologyLayer = altitude (layer 0 at the top / the
// root, deeper layers below), so the Layer slider literally descends the graph.
// Depth defaults from the app-wide Level badge (U1) and is fine-tuned 0–5 here.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";
import { planForLevel } from "@/lib/ars-query";
import { useLevel } from "@/components/LevelProvider";

// The 5 disease subjects (spec §2) — slugs match the gateway's subject_key.
const SUBJECTS: { key: string; label: string }[] = [
  { key: "rbc-mpn-pv", label: "RBC / MPN / PV" },
  { key: "cystic-fibrosis", label: "Cystic Fibrosis" },
  { key: "epilepsy", label: "Epilepsy" },
  { key: "huntingtons", label: "Huntington's" },
  { key: "cancer", label: "Cancer" },
];

interface FeedNode {
  id: string;
  type: string;
  label: string;
  ontology_layer: number;
  confidence: number | null;
  mass: number;
  provenance: "available" | "unavailable";
  definition?: string | null;
}
interface FeedEdge {
  id: string;
  source: string;
  target: string;
  rel_type: string;
  edge_kind: string;
  weight: number | null;
}
interface Feed {
  subject: string;
  available: boolean;
  max_layer: number;
  nodes: FeedNode[];
  edges: FeedEdge[];
  error?: string;
}

type Vec3 = [number, number, number];

const LAYER_GAP = 3.2;
// Node visuals by graph type (D0 seeds `subject` roots + `mechanism` nodes).
const TYPE_STYLE: Record<string, { color: string; kind: "ico" | "sphere" }> = {
  subject: { color: "#a855f7", kind: "ico" },     // purple root landmark
  mechanism: { color: "#22d3ee", kind: "sphere" }, // cyan mechanism
};
const EDGE_COLOR: Record<string, string> = {
  influence: "#38bdf8", // cyan — runtime/associative
  causal: "#f5c542",    // gold — validated (never emitted by a seed)
};

/** Deterministic layered layout: OntologyLayer → altitude, nodes fanned in a
 *  ring within their layer. Stable across renders for a given feed. */
function layoutPositions(nodes: FeedNode[]): Map<string, Vec3> {
  const byLayer = new Map<number, FeedNode[]>();
  for (const n of nodes) {
    const g = byLayer.get(n.ontology_layer) ?? [];
    g.push(n);
    byLayer.set(n.ontology_layer, g);
  }
  const pos = new Map<string, Vec3>();
  for (const [layer, group] of byLayer) {
    const y = (2.5 - layer) * LAYER_GAP; // layer 0 highest
    const count = group.length;
    const radius = count <= 1 ? 0 : Math.max(2.4, count * 0.75);
    group.forEach((n, i) => {
      const angle = (i / count) * Math.PI * 2;
      pos.set(n.id, [Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    });
  }
  return pos;
}

function GraphNode({
  node,
  position,
  onHover,
}: {
  node: FeedNode;
  position: Vec3;
  onHover: (n: FeedNode | null) => void;
}) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const style = TYPE_STYLE[node.type] ?? { color: "#94a3b8", kind: "sphere" as const };
  const size = 0.35 + (node.mass ?? 0.5) * 0.5;

  return (
    <mesh
      ref={ref}
      position={position}
      scale={hovered ? 1.25 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(node);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      {style.kind === "ico" ? (
        <icosahedronGeometry args={[size, 0]} />
      ) : (
        <sphereGeometry args={[size, 24, 24]} />
      )}
      <meshStandardMaterial
        color={style.color}
        emissive={style.color}
        emissiveIntensity={hovered ? 0.9 : 0.35}
        roughness={0.35}
        metalness={0.4}
      />
      {hovered && (
        <Html distanceFactor={10} position={[0, size + 0.4, 0]} center>
          <div
            style={{
              pointerEvents: "none",
              whiteSpace: "nowrap",
              background: "rgba(9,14,28,0.92)",
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#e2e8f0",
              fontSize: 12,
              maxWidth: 220,
            }}
          >
            <div style={{ fontWeight: 600 }}>{node.label}</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              layer {node.ontology_layer} · {node.type}
              {node.confidence != null && ` · conf ${node.confidence.toFixed(2)}`}
            </div>
            <div
              style={{
                fontSize: 11,
                color: node.provenance === "available" ? "#34d399" : "#fbbf24",
              }}
            >
              provenance: {node.provenance}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Scene({
  feed,
  onHover,
}: {
  feed: Feed;
  onHover: (n: FeedNode | null) => void;
}) {
  const positions = useMemo(() => layoutPositions(feed.nodes), [feed.nodes]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 12, 8]} intensity={120} />
      <pointLight position={[-8, -6, -10]} intensity={40} color="#6366f1" />

      {feed.edges.map((e) => {
        const a = positions.get(e.source);
        const b = positions.get(e.target);
        if (!a || !b) return null;
        return (
          <Line
            key={e.id}
            points={[a, b]}
            color={EDGE_COLOR[e.edge_kind] ?? "#64748b"}
            lineWidth={1 + (e.weight ?? 0.5) * 1.5}
            transparent
            opacity={0.55}
          />
        );
      })}

      {feed.nodes.map((n) => {
        const p = positions.get(n.id);
        return p ? <GraphNode key={n.id} node={n} position={p} onHover={onHover} /> : null;
      })}

      <OrbitControls enablePan enableZoom enableRotate makeDefault />
    </>
  );
}

export default function FlightSim() {
  const { level } = useLevel();
  const [subject, setSubject] = useState(SUBJECTS[0].key);
  // Layer slider (0–5). Defaults from the app-wide Level badge (U1); the badge
  // drives the default depth, the slider gives fine control.
  const [maxLayer, setMaxLayer] = useState<number>(() => planForLevel(level).layerMax);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<FeedNode | null>(null);

  // When the Level badge changes, reset the slider to that Level's depth.
  useEffect(() => {
    setMaxLayer(planForLevel(level).layerMax);
  }, [level]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/graph/traverse?subject=${encodeURIComponent(subject)}&max_layer=${maxLayer}`,
      );
      setFeed((await res.json()) as Feed);
    } catch {
      setFeed({ subject, available: false, max_layer: maxLayer, nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }, [subject, maxLayer]);

  useEffect(() => {
    load();
  }, [load]);

  const subjectLabel = SUBJECTS.find((s) => s.key === subject)?.label ?? subject;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-bio-navy">
      {/* Scene */}
      <Canvas camera={{ position: [0, 4, 16], fov: 55 }}>
        <color attach="background" args={["#070c1c"]} />
        {feed && feed.available && <Scene feed={feed} onHover={setHovered} />}
      </Canvas>

      {/* Top-left: subject + status */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-white/10 bg-bio-navy/80 px-3 py-2 backdrop-blur">
          <label className="text-xs uppercase tracking-wide text-slate-400">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-bio-teal"
          >
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key} className="bg-bio-navy">
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pointer-events-none rounded-md bg-bio-navy/70 px-3 py-1 text-xs text-slate-400 backdrop-blur">
          {loading
            ? "loading…"
            : feed?.available
              ? `${feed.nodes.length} nodes · ${feed.edges.length} arcs · layer ≤ ${feed.max_layer}`
              : `no graph for ${subjectLabel} yet — seed pending (honest empty)`}
        </div>
      </div>

      {/* Right: vertical layer slider (0 top → 5 ground), spec §"Layer Slider" */}
      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 rounded-lg border border-white/10 bg-bio-navy/80 px-3 py-4 backdrop-blur">
        <span className="text-[10px] uppercase tracking-widest text-slate-400">Layer</span>
        <span className="text-lg font-semibold text-bio-teal">{maxLayer}</span>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={maxLayer}
          onChange={(e) => setMaxLayer(Number(e.target.value))}
          // vertical slider
          className="h-40 w-2 cursor-pointer"
          style={{ writingMode: "vertical-lr", direction: "rtl" }}
          aria-label="Ontology layer depth"
        />
        <span className="text-[10px] text-slate-500">depth</span>
      </div>

      {/* Bottom: hovered node brief (also shown as an in-scene card) */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 max-w-md -translate-x-1/2 rounded-lg border border-white/10 bg-bio-navy/85 px-4 py-2 text-center backdrop-blur">
        {hovered ? (
          <>
            <div className="text-sm font-semibold text-white">{hovered.label}</div>
            {hovered.definition && (
              <div className="text-xs text-slate-400">{hovered.definition}</div>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-500">
            Orbit to explore · hover a node · slide the Layer control to descend the ontology
          </div>
        )}
      </div>
    </div>
  );
}
