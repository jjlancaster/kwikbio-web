// Query Manager lifecycle (spec §3.2):
//   parse → plan → route → execute → assemble → provenance-stamp → return
//
// Self-contained (no kwikbio-* imports). Reads live data from the ARS engine
// (jjlancaster/ars-fs, via engine.ts) for seeded subjects; falls back to a
// deterministic mock for not-yet-seeded subjects and off-Jewel dev.

import { DEFAULT_ANON_LEVEL, planForLevel } from "./levels";
import { fetchEngineSnapshot } from "./engine";
import type {
  EdgeKind,
  Level,
  ProvenanceAvailability,
  ProvenanceEntry,
  QMEdge,
  QMObject,
  QMRoute,
  QueryManagerRequest,
  QueryManagerResponse,
  RelationshipStatus,
} from "./types";

// Subjects with a live SSKM seed in the engine today (Hydro: MPN/PV seeded).
// Others resolve to mock until their Neo4j/SSKM seed lands (D0).
const ENGINE_SUBJECTS = new Set(["rbc-mpn-pv"]);

interface RawEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}
interface RawSnapshot {
  subject: string;
  confidence: number;
  objects: QMObject[];
  edges: RawEdge[];
  routes: QMRoute[];
  provenanceAvailable: boolean;
  source: "gateway" | "mock";
}

// ─── Mock seed (layer-tagged), used off-Jewel / for unseeded subjects ────────
interface SeedObject {
  label: string;
  role: QMObject["role"];
  confidence: number;
  definition: string;
  layer: number;
}
interface Seed {
  subject: string;
  objects: SeedObject[];
  edges: RawEdge[];
  routes?: QMRoute[];
}

const SEEDS: Record<string, Seed> = {
  "rbc-mpn-pv": {
    subject: "RBC / MPN / PV",
    objects: [
      { label: "JAK2 V617F", role: "subsystem", confidence: 0.94, definition: "Driver mutation in the JAK2 kinase; constitutive activation.", layer: 0 },
      { label: "Erythrocytosis", role: "goal", confidence: 0.9, definition: "Elevated red cell mass, the PV phenotype.", layer: 1 },
      { label: "STAT5 signaling", role: "subsystem", confidence: 0.82, definition: "Downstream transcriptional effector of JAK2.", layer: 2 },
      { label: "EPO receptor", role: "peer", confidence: 0.78, definition: "Cytokine receptor scaffolding JAK2.", layer: 3 },
    ],
    edges: [
      { source: "JAK2 V617F", target: "STAT5 signaling", relation: "activates", confidence: 0.88 },
      { source: "STAT5 signaling", target: "Erythrocytosis", relation: "drives", confidence: 0.8 },
      { source: "EPO receptor", target: "JAK2 V617F", relation: "scaffolds", confidence: 0.7 },
    ],
    routes: [
      { id: "A", strategy: "JAK2 inhibition (ruxolitinib)", successProbability: 0.72, timeMonths: 12, costTier: 2, risk: "med", evidenceStrength: 0.8 },
      { id: "B", strategy: "Therapeutic phlebotomy + low-dose aspirin", successProbability: 0.64, timeMonths: 6, costTier: 1, risk: "low", evidenceStrength: 0.7 },
      { id: "C", strategy: "Interferon-α (cytoreduction)", successProbability: 0.58, timeMonths: 18, costTier: 3, risk: "med", evidenceStrength: 0.6 },
      { id: "D", strategy: "Allele-burden-guided combination", successProbability: 0.41, timeMonths: 24, costTier: 4, risk: "high", evidenceStrength: 0.4 },
      { id: "E", strategy: "Watchful waiting (low-risk stratum)", successProbability: 0.5, timeMonths: 36, costTier: 1, risk: "low", evidenceStrength: 0.5 },
    ],
  },
};

function subjectKey(subject: string | undefined): string {
  if (!subject) return "rbc-mpn-pv";
  return subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fallbackSeed(subject: string): Seed {
  return {
    subject,
    objects: [
      { label: subject, role: "goal", confidence: 0.6, definition: `Studied subject: ${subject}.`, layer: 0 },
      { label: "Candidate mechanism", role: "subsystem", confidence: 0.45, definition: "Placeholder mechanism node pending SSKM seed.", layer: 1 },
    ],
    edges: [{ source: "Candidate mechanism", target: subject, relation: "influences", confidence: 0.4 }],
  };
}

// ─── Recenter (R4): re-root the subgraph on a focus node/predicate ───────────
// current_focus makes the chosen node the new centre (layer 0); every other
// node is re-layered by its graph-hop distance from the focus (undirected BFS).
// The Level bound then applies to THESE distances, so recentering on a node
// shows its neighbourhood at the current depth (Beginner = 1 hop, Pro = up to 5).
function recenterLayers(
  objects: QMObject[],
  edges: RawEdge[],
  focusLabel: string
): Map<string, number> {
  const adj = new Map<string, Set<string>>();
  const touch = (a: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    return adj.get(a)!;
  };
  for (const e of edges) {
    touch(e.source).add(e.target);
    touch(e.target).add(e.source);
  }
  const layer = new Map<string, number>([[focusLabel, 0]]);
  const queue: string[] = [focusLabel];
  while (queue.length) {
    const n = queue.shift()!;
    const d = layer.get(n)!;
    for (const nb of adj.get(n) ?? []) {
      if (!layer.has(nb)) {
        layer.set(nb, d + 1);
        queue.push(nb);
      }
    }
  }
  return layer;
}

// Resolve a caller-supplied focus (a node label, or an edge "source→target"
// predicate) to a concrete node label present in the graph, or null.
function resolveFocus(focus: string | undefined, objects: QMObject[], edges: RawEdge[]): string | null {
  const f = focus?.trim();
  if (!f) return null;
  const byLabel = (needle: string) =>
    objects.find((o) => o.label.toLowerCase() === needle.toLowerCase())?.label ?? null;
  const direct = byLabel(f);
  if (direct) return direct;
  // Predicate form "A→B" / "A->B": recentre on the relationship's target.
  const m = f.split(/\s*(?:->|→)\s*/);
  if (m.length === 2) {
    const edge = edges.find(
      (e) =>
        e.source.toLowerCase() === m[0].toLowerCase() &&
        e.target.toLowerCase() === m[1].toLowerCase()
    );
    if (edge) return edge.target;
    return byLabel(m[1]) ?? byLabel(m[0]);
  }
  return null;
}

function deriveRoutes(objects: QMObject[]): QMRoute[] {
  return objects
    .filter((o) => o.role !== "goal")
    .slice(0, 4)
    .map((o, i) => ({
      id: String.fromCharCode(65 + i),
      strategy: `Target ${o.label}`,
      successProbability: Math.round(o.confidence * 100) / 100,
      timeMonths: 6 + i * 6,
      costTier: ((i % 4) + 1) as 1 | 2 | 3 | 4,
      risk: (o.confidence > 0.7 ? "low" : o.confidence > 0.5 ? "med" : "high") as QMRoute["risk"],
      evidenceStrength: Math.round(o.confidence * 100) / 100,
    }));
}

// ─── Provenance stamping (honest — never fabricate a chain) ──────────────────
function stampEdge(e: RawEdge, avail: ProvenanceAvailability): QMEdge {
  const status: RelationshipStatus = "candidate";
  const edgeKind: EdgeKind = "influence";
  const provenance: ProvenanceEntry[] =
    avail === "available"
      ? [
          {
            id: `prov-${e.source}-${e.target}`,
            sourceType: "reduction",
            createdAt: new Date().toISOString(),
            createdBy: "ars-engine",
            confidence: e.confidence,
            sourceRefs: ["ars-engine:sskm"],
            note: "SSKM reduction edge; full chain via /api/graph/provenance",
          },
        ]
      : []; // provenance dark → no fabricated entries
  return { source: e.source, target: e.target, relation: e.relation, edgeKind, status, confidence: e.confidence, provenance };
}

async function gatherRaw(subject: string, key: string): Promise<RawSnapshot> {
  if (ENGINE_SUBJECTS.has(key)) {
    const snap = await fetchEngineSnapshot(subject);
    if (snap) {
      return {
        subject: snap.subject,
        confidence: snap.confidence,
        objects: snap.objects,
        edges: snap.edges.map((e) => ({ source: e.source, target: e.target, relation: e.relation, confidence: e.confidence })),
        routes: snap.routes,
        provenanceAvailable: snap.provenanceAvailable,
        source: "gateway",
      };
    }
  }
  const seed = SEEDS[key] ?? fallbackSeed(subject);
  return {
    subject: seed.subject,
    confidence: seed.objects.length ? Math.max(...seed.objects.map((o) => o.confidence)) : 0,
    objects: seed.objects,
    edges: seed.edges,
    routes: seed.routes ?? deriveRoutes(seed.objects),
    provenanceAvailable: false,
    source: "mock",
  };
}

/** Resolve a research query into a Level-bounded, provenance-honest response. */
export async function resolveQuery(req: QueryManagerRequest): Promise<QueryManagerResponse> {
  // 1. Parse
  const level: Level = req.level ?? DEFAULT_ANON_LEVEL;
  const plan = planForLevel(level);
  const subject = req.subject ?? "RBC / MPN / PV";
  const requested = req.requested ?? ["objects", "prism9", "provenance"];
  const key = subjectKey(subject);
  const planNotes: string[] = [`level=${level} layer≤${plan.layerMax}`];

  // 2/3/4. Plan + route + execute (engine, else mock)
  const raw = await gatherRaw(subject, key);
  planNotes.push(raw.source === "gateway" ? "live ARS engine" : "engine unreachable/unseeded → mock");

  // 4b. Recenter (R4) — if a focus is given, re-root layers on it (BFS hops).
  let workObjects = raw.objects;
  const focusLabel = resolveFocus(req.currentFocus, raw.objects, raw.edges);
  if (focusLabel) {
    const relayer = recenterLayers(raw.objects, raw.edges, focusLabel);
    // Unreachable nodes get a layer past Pro's max so the Level bound drops them.
    workObjects = raw.objects.map((o) => ({ ...o, layer: relayer.get(o.label) ?? plan.layerMax + 99 }));
    planNotes.push(`recentered on "${focusLabel}"`);
  }

  // 5. Assemble — Level layer bound + plan cost ceiling.
  const objects: QMObject[] = workObjects
    .filter((o) => o.layer <= plan.layerMax)
    .slice(0, plan.maxObjects);

  // R1 "see what you're missing": how many more nodes full depth (Pro, layer 5)
  // would reveal beyond this Level. The UI shows this as a locked teaser for
  // freemium/anon users so the value of going deeper is visible, not hidden.
  const fullDepthCount = workObjects.filter((o) => o.layer <= 5).length;
  const deeperCount = Math.max(0, fullDepthCount - objects.length);
  const keepLabels = new Set(objects.map((o) => o.label));

  // 6. Provenance-stamp (honest flag).
  const availability: ProvenanceAvailability = raw.provenanceAvailable ? "available" : "unavailable";
  if (availability === "unavailable") planNotes.push("provenance graph down → provenance:unavailable");

  const edges: QMEdge[] = raw.edges
    .filter((e) => keepLabels.has(e.source) && keepLabels.has(e.target))
    .slice(0, plan.maxEdges)
    .map((e) => stampEdge(e, availability));

  // 7. Return
  const response: QueryManagerResponse = {
    subject: raw.subject,
    confidence: raw.confidence,
    level,
    layerBound: plan.layerMax,
    objects,
    edges,
    provenance: availability,
    planNotes,
    source: raw.source,
  };
  if (focusLabel) response.focus = focusLabel;
  if (deeperCount > 0 && level !== "pro") response.deeperCount = deeperCount;
  if (requested.includes("lope") && plan.includeLope) response.lope = [];
  if (requested.includes("prism9")) response.prism9Graph = { nodes: objects.length, edges: edges.length };
  response.routes = level === "beginner" ? raw.routes.slice(0, 3) : raw.routes;

  return response;
}
