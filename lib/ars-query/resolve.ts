// Query Manager lifecycle (spec §3.2):
//   parse → plan → route → execute → assemble → provenance-stamp → return
//
// Self-contained (no kwikbio-* imports). Talks to the live ARS gateway when
// reachable, else assembles a deterministic mock so the UI works off-Jewel.

import { DEFAULT_ANON_LEVEL, planForLevel } from "./levels";
import type {
  EdgeKind,
  Level,
  ProvenanceAvailability,
  ProvenanceEntry,
  QMEdge,
  QMObject,
  QueryManagerRequest,
  QueryManagerResponse,
  RelationshipStatus,
} from "./types";

const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";
const GATEWAY_TIMEOUT_MS = 5_000;

/** P0 gate — provenance is only "available" once gs_nodes/gs_edges exist on Jewel. */
function graphAvailable(): boolean {
  return process.env.GRAPH_AVAILABLE === "true";
}

// ─── Mock knowledge seed (layer-tagged), used when the gateway is unreachable ─
interface SeedObject {
  label: string;
  role: QMObject["role"];
  confidence: number;
  definition: string;
  layer: number;
}
interface SeedEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}
interface Seed {
  subject: string;
  objects: SeedObject[];
  edges: SeedEdge[];
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

// ─── Provenance stamping (honest — never fabricate a chain) ──────────────────
function stampEdge(e: SeedEdge, avail: ProvenanceAvailability): QMEdge {
  const status: RelationshipStatus = "candidate"; // runtime edges start as candidate
  const edgeKind: EdgeKind = "influence"; // never "causal" until validated (Rule 4)
  const provenance: ProvenanceEntry[] =
    avail === "available"
      ? [
          {
            id: `prov-${e.source}-${e.target}`,
            sourceType: "reduction",
            createdAt: new Date().toISOString(),
            createdBy: "ars-query",
            confidence: e.confidence,
            sourceRefs: ["sskm:reduction"],
            note: "reduction-derived candidate edge",
          },
        ]
      : []; // provenance dark → no fabricated entries
  return { source: e.source, target: e.target, relation: e.relation, edgeKind, status, confidence: e.confidence, provenance };
}

async function tryGateway(query: string, subject: string): Promise<Seed | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), GATEWAY_TIMEOUT_MS);
    const res = await fetch(`${ARS_GATEWAY}/v1/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, subject }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      subject?: string;
      objects?: SeedObject[];
      edges?: SeedEdge[];
    };
    if (!data.objects) return null;
    return { subject: data.subject ?? subject, objects: data.objects, edges: data.edges ?? [] };
  } catch {
    return null; // unreachable / non-JSON stream → mock
  }
}

/** Resolve a research query into a Level-bounded, provenance-honest response. */
export async function resolveQuery(req: QueryManagerRequest): Promise<QueryManagerResponse> {
  // 1. Parse
  const level: Level = req.level ?? DEFAULT_ANON_LEVEL;
  const plan = planForLevel(level);
  const subject = req.subject ?? "RBC / MPN / PV";
  const requested = req.requested ?? ["objects", "prism9", "provenance"];
  const planNotes: string[] = [`level=${level} layer≤${plan.layerMax}`];

  // 2/3/4. Plan + route + execute
  const key = subjectKey(subject);
  let source: QueryManagerResponse["source"] = "gateway";
  let seed = await tryGateway(req.query, subject);
  if (!seed) {
    source = "mock";
    seed = SEEDS[key] ?? fallbackSeed(subject);
    planNotes.push("gateway unreachable → mock seed");
  }

  // 5. Assemble — Level layer bound + plan cost ceiling.
  const objects: QMObject[] = seed.objects
    .filter((o) => o.layer <= plan.layerMax)
    .slice(0, plan.maxObjects)
    .map((o) => ({ ...o }));
  const keepLabels = new Set(objects.map((o) => o.label));

  // 6. Provenance-stamp (honest flag).
  const availability: ProvenanceAvailability = graphAvailable() ? "available" : "unavailable";
  if (availability === "unavailable") planNotes.push("GRAPH_AVAILABLE=false → provenance:unavailable");

  const edges: QMEdge[] = seed.edges
    .filter((e) => keepLabels.has(e.source) && keepLabels.has(e.target))
    .slice(0, plan.maxEdges)
    .map((e) => stampEdge(e, availability));

  const floor = req.confidenceFloor ?? 0.5;
  const kept = objects.filter((o) => o.confidence >= floor);
  const confidence = kept.length ? Math.max(...kept.map((o) => o.confidence)) : (objects[0]?.confidence ?? 0);

  // 7. Return
  const response: QueryManagerResponse = {
    subject: seed.subject,
    confidence,
    level,
    layerBound: plan.layerMax,
    objects,
    edges,
    provenance: availability,
    planNotes,
    source,
  };
  if (requested.includes("lope") && plan.includeLope) response.lope = [];
  if (requested.includes("prism9")) response.prism9Graph = { nodes: objects.length, edges: edges.length };
  return response;
}
