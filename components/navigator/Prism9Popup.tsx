"use client";

// U2 — the Prism9 popup (spec §5 entry flow):
//   select Subject → Prism9 popup (ResearchCluster subgraph at Level depth)
//   → land on a node, or launch the Navigator flight.
//
// The cluster is Level-aware BY CONSTRUCTION: the Query Manager already bounds
// `objects` to the Level's layerBound (spec §3.4), so Beginner shows a shallow
// cluster and Pro a deep one — this popup renders whatever the QM returned.
//
// "Landing" (flight-sim Mode 3) is done here in 2D: selecting a node eases the
// view toward it (the landing approach) and opens its content card. The full
// 3D free-flight (Modes 1/2/4, Three.js) is Navigator Layer 1 (owned by Watt,
// ARS-NAVIGATOR-FLIGHT-SIM-v1) — the "Launch flight" button is the handoff.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QMObject, QueryManagerResponse } from "@/lib/ars-query";
import { LevelSymbol, LEVEL_META } from "@/components/LevelSymbol";

const ROLE_TONE: Record<QMObject["role"], string> = {
  goal: "#f5c842", // bio-gold
  subsystem: "#00d4c8", // bio-teal
  peer: "#8b7bd8", // muted purple
};

interface Pt {
  x: number;
  y: number;
}

const SIZE = 520;
const CENTER = SIZE / 2;

export default function Prism9Popup({
  result,
  open,
  onClose,
  onLaunchFlight,
}: {
  result: QueryManagerResponse | null;
  open: boolean;
  onClose: () => void;
  onLaunchFlight: (nodeLabel: string | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const tourRef = useRef<number | null>(null);

  const objects = useMemo(() => result?.objects ?? [], [result]);
  const edges = result?.edges ?? [];

  // Radial layout: subject at centre; objects on rings by OntologyLayer.
  const pos = useMemo(() => {
    const m = new Map<string, Pt>();
    if (result) m.set(result.subject, { x: CENTER, y: CENTER });
    objects.forEach((o, i) => {
      const angle = (i / Math.max(objects.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = 70 + Math.min(o.layer, 5) * 34;
      m.set(o.label, {
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle),
      });
    });
    return m;
  }, [result, objects]);

  const selectedObj = objects.find((o) => o.label === selected) ?? null;

  // Landing approach (Mode 3): ease the cluster toward the selected node.
  const target = selected ? pos.get(selected) : null;
  const k = target ? 1.7 : 1;
  const tx = target ? CENTER - k * target.x : 0;
  const ty = target ? CENTER - k * target.y : 0;

  // Guided slalom (Mode 2), 2D: auto-advance the landing through the cluster.
  useEffect(() => {
    if (!touring || objects.length === 0) return;
    let i = 0;
    setSelected(objects[0].label);
    tourRef.current = window.setInterval(() => {
      i += 1;
      if (i >= objects.length) {
        setTouring(false);
        return;
      }
      setSelected(objects[i].label);
    }, 1600);
    return () => {
      if (tourRef.current) window.clearInterval(tourRef.current);
    };
  }, [touring, objects]);

  // Reset transient state whenever the popup closes.
  useEffect(() => {
    if (!open) {
      setSelected(null);
      setTouring(false);
    }
  }, [open]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  const levelMeta = LEVEL_META.find((l) => l.value === result?.level);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prism9 research cluster"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bio-navy text-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-bio-teal">
              Prism9 Cluster
            </span>
            <h2 className="text-lg font-semibold text-white">
              {result?.subject ?? "—"}
            </h2>
            {levelMeta && (
              <span className="flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-300">
                <LevelSymbol shape={levelMeta.shape} size={13} />
                {levelMeta.label} · layer ≤ {result?.layerBound}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body: cluster + landing panel */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_260px]">
          {/* Cluster */}
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(74,29,142,0.25),transparent_70%)]">
            {objects.length === 0 ? (
              <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500">
                No cluster yet — run a subject.
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="block h-full max-h-[60vh] w-full"
                role="img"
                aria-label="research cluster"
              >
                <g
                  style={{
                    transform: `translate(${tx}px, ${ty}px) scale(${k})`,
                    transformOrigin: "0 0",
                    transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  {/* hop rings (depth = OntologyLayer, governed by Level) */}
                  {[1, 2, 3, 4, 5].map((ring) => (
                    <circle
                      key={ring}
                      cx={CENTER}
                      cy={CENTER}
                      r={70 + ring * 34 - 17}
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                    />
                  ))}

                  {/* edges */}
                  {edges.map((e, i) => {
                    const a = pos.get(e.source);
                    const b = pos.get(e.target);
                    if (!a || !b) return null;
                    const dim =
                      selected && e.source !== selected && e.target !== selected;
                    return (
                      <line
                        key={i}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={
                          e.edgeKind === "causal"
                            ? "rgba(0,212,200,0.55)"
                            : "rgba(255,255,255,0.18)"
                        }
                        strokeDasharray={e.edgeKind === "causal" ? undefined : "3 3"}
                        opacity={dim ? 0.15 : 1}
                      />
                    );
                  })}

                  {/* subject core */}
                  {result && (() => {
                    const p = pos.get(result.subject)!;
                    return (
                      <g>
                        <circle cx={p.x} cy={p.y} r={18} fill="#4a1d8e" stroke="#f5c842" strokeWidth={1.5} />
                        <text x={p.x} y={p.y + 32} textAnchor="middle" className="fill-white" style={{ fontSize: 10 }}>
                          {result.subject.length > 22 ? result.subject.slice(0, 21) + "…" : result.subject}
                        </text>
                      </g>
                    );
                  })()}

                  {/* object nodes — click to land */}
                  {objects.map((o) => {
                    const p = pos.get(o.label);
                    if (!p) return null;
                    const isSel = o.label === selected;
                    const r = 6 + o.confidence * 7;
                    return (
                      <g
                        key={o.label}
                        role="button"
                        aria-label={`Land on ${o.label}`}
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setTouring(false);
                          setSelected(isSel ? null : o.label);
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            setTouring(false);
                            setSelected(isSel ? null : o.label);
                          }
                        }}
                      >
                        {isSel && (
                          <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke="#00d4c8" strokeWidth={1.5} />
                        )}
                        <circle cx={p.x} cy={p.y} r={r} fill={ROLE_TONE[o.role]} opacity={isSel ? 1 : 0.85} />
                        <text x={p.x} y={p.y - r - 4} textAnchor="middle" className="fill-slate-300" style={{ fontSize: 9 }}>
                          {o.label.length > 18 ? o.label.slice(0, 17) + "…" : o.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* legend */}
            <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.goal }} />goal</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.subsystem }} />subsystem</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.peer }} />peer</span>
            </div>
          </div>

          {/* Landing panel */}
          <aside className="border-t border-white/10 bg-white/[0.03] p-4 md:border-l md:border-t-0">
            {selectedObj ? (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-widest text-bio-teal">Landed</div>
                <h3 className="text-base font-semibold text-white">{selectedObj.label}</h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">role</dt>
                    <dd className="text-slate-300">{selectedObj.role}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">layer</dt>
                    <dd className="text-slate-300">{selectedObj.layer}</dd>
                  </div>
                  {/* Raw confidence is Level-gated by the QM; show it when present. */}
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">confidence</dt>
                    <dd className="text-slate-300">{Math.round(selectedObj.confidence * 100)}%</dd>
                  </div>
                </dl>
                <p className="text-sm leading-relaxed text-slate-400">{selectedObj.definition}</p>
                <button
                  type="button"
                  onClick={() => onLaunchFlight(selectedObj.label)}
                  className="mt-1 w-full rounded-md bg-bio-teal px-3 py-2 text-sm font-semibold text-bio-navy hover:opacity-90"
                >
                  Launch flight to this node →
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-400">
                <div className="text-xs uppercase tracking-widest text-slate-500">Flight deck</div>
                <p>Click a node to land on it, or take a guided pass through the cluster.</p>
                <button
                  type="button"
                  onClick={() => setTouring((t) => !t)}
                  className="w-full rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  {touring ? "Stop guided pass" : "Guided pass ▶"}
                </button>
                <button
                  type="button"
                  onClick={() => onLaunchFlight(null)}
                  className="w-full rounded-md bg-bio-teal px-3 py-2 text-sm font-semibold text-bio-navy hover:opacity-90"
                >
                  Launch Navigator flight →
                </button>
                <p className="pt-1 text-[11px] leading-relaxed text-slate-600">
                  Full 3D free-flight is Navigator Layer 1 (Three.js). This popup
                  is the Level-aware entry + 2D landing approach.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
