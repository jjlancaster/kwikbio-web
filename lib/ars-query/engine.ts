// Adapter to the live ARS engine (jjlancaster/ars-fs, Flask/Gunicorn on :5000).
//
// Reconciled against the real engine contract (ars-fs app.py + models.py):
//   GET /api/state       → { sskm: { parameters{name:{confidence,value,...}},
//                                    relationships[{from,to,type,strength}] },
//                            goal, gap, progress, last_congruence, lope_count }
//   GET /api/lope        → ExperimentObject[] { id,name,description,cost,duration,
//                                               info_gain_profile{param:gain} }
//   GET /api/graph/stats → provenance graph availability (503 if not initialised)
//
// The graph + provenance live in the ENGINE, not in kwikbio-web — the Query
// Manager reads them, it does not own them.

import type { QMEdge, QMObject, QMRoute } from "./types";

const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";
const TIMEOUT_MS = 5_000;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${ARS_GATEWAY}${path}`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface SskmParam {
  value: number | null;
  confidence: number;
  units?: string;
  description?: string;
  source?: string | null;
}
interface Sskm {
  version?: number;
  parameters?: Record<string, SskmParam>;
  relationships?: Array<{ from: string; to: string; type?: string; strength?: number }>;
  metadata?: Record<string, unknown>;
}
interface StateResp {
  status?: string;
  sskm?: Sskm;
  goal?: { description?: string; target_parameters?: Record<string, unknown> } | null;
  progress?: { confidence?: number } | null;
  last_congruence?: number | null;
}
interface LopeEO {
  id: string;
  name: string;
  description?: string;
  cost?: number;
  duration?: number;
  info_gain_profile?: Record<string, number>;
}

export interface EngineSnapshot {
  subject: string;
  confidence: number;
  objects: QMObject[];
  edges: QMEdge[];
  routes: QMRoute[];
  provenanceAvailable: boolean;
}

// SSKM parameters carry no OntologyLayer; assign layer by confidence rank so
// the Level bound still reveals progressively more (highest-confidence = core).
function layerForRank(rank: number, n: number): number {
  const bucket = Math.max(1, Math.ceil(n / 6));
  return Math.min(5, Math.floor(rank / bucket));
}

/**
 * Pull a live snapshot from the engine and map it to Query Manager types.
 * Returns null if the engine is unreachable or has no SSKM loaded (→ mock).
 */
export async function fetchEngineSnapshot(displaySubject: string): Promise<EngineSnapshot | null> {
  const state = await getJson<StateResp>("/api/state");
  if (!state?.sskm?.parameters) return null;

  const params = state.sskm.parameters;
  const targets = new Set(Object.keys(state.goal?.target_parameters ?? {}));
  const entries = Object.entries(params);

  const ranked = [...entries].sort((a, b) => (b[1].confidence ?? 0) - (a[1].confidence ?? 0));
  const layerOf = new Map<string, number>();
  ranked.forEach(([name], i) => layerOf.set(name, targets.has(name) ? 0 : layerForRank(i, ranked.length)));

  const objects: QMObject[] = entries.map(([name, p]) => ({
    label: name,
    role: targets.has(name) ? "goal" : "subsystem",
    confidence: p.confidence ?? 0,
    definition: p.description || `${name}${p.units ? ` (${p.units})` : ""}`,
    layer: layerOf.get(name) ?? 3,
  }));

  const edges: QMEdge[] = (state.sskm.relationships ?? []).map((r) => ({
    source: r.from,
    target: r.to,
    relation: r.type || "influences",
    edgeKind: "influence", // never causal until validated (boundary-map Rule 4)
    status: "candidate",
    confidence: r.strength ?? 0.5,
    provenance: [], // chains fetched on demand via /api/graph/provenance/<id>
  }));

  const gstats = await getJson<{ available?: boolean }>("/api/graph/stats");
  const provenanceAvailable = gstats != null && gstats.available !== false;

  const lope = (await getJson<LopeEO[]>("/api/lope")) ?? [];
  const routes: QMRoute[] = lope.slice(0, 5).map((eo, i) => {
    const gains = Object.values(eo.info_gain_profile ?? {});
    const gain = gains.length ? Math.max(...gains) : 0.5;
    return {
      id: String.fromCharCode(65 + i),
      strategy: eo.name,
      successProbability: Math.round(gain * 100) / 100,
      timeMonths: Math.max(1, Math.round(eo.duration ?? 6)),
      costTier: Math.min(4, Math.max(1, Math.ceil((eo.cost ?? 1) / 25))) as 1 | 2 | 3 | 4,
      risk: gain > 0.7 ? "low" : gain > 0.4 ? "med" : "high",
      evidenceStrength: Math.round(gain * 100) / 100,
    };
  });

  const confidence =
    state.progress?.confidence ??
    (typeof state.last_congruence === "number" ? state.last_congruence : undefined) ??
    (objects.length ? Math.max(...objects.map((o) => o.confidence)) : 0);

  return { subject: displaySubject, confidence, objects, edges, routes, provenanceAvailable };
}
