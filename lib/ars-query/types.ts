// ars-query — the Query Manager (patent figure 206 / ARS Core module).
//
// BOUNDARY-MAP CONTRACT (ARS-V3-NAMING-AND-BOUNDARY-MAP):
//   This module is arena-general ARS Core. It must NOT import from any
//   kwikbio-* code. kwikbio-web *calls* it; it does not own it. Keeping this
//   directory self-contained lets it extract to an `ars-core` package later
//   without a rewrite.
//
// Implements:
//   - ARS-FS4.2 Draft-1 §3 (Query Manager lifecycle + Level→layer depth)
//   - PRISM Spec Amendment rev 1.1 §A2/§A3 (provenance contract + transitions)

// ─── Level system (NAV-DESIGN-v1 + spec §3.4) ────────────────────────────────
export type Level = "beginner" | "novice" | "pro";

export interface LevelPlan {
  level: Level;
  /** OntologyLayer lower/upper bound applied to every graph sub-query. */
  layerMin: number;
  layerMax: number;
  showRawConfidence: boolean;
  includeLope: boolean;
  includeSskm: boolean;
  expandProvenance: boolean;
  /** Plan cost ceiling — max nodes/edges assembled (CPU guard for the Hostinger ceiling). */
  maxObjects: number;
  maxEdges: number;
}

// ─── Edge kind (boundary-map Rule 4: influence until validated) ──────────────
export type EdgeKind = "influence" | "causal";

// ─── PRISM provenance contract (Amendment rev 1.1 §A2.1) ─────────────────────
export type ProvenanceSourceType =
  | "correlation" // statistical association; can never promote alone
  | "knowledge_graph" // kwiKBio / ARS KG assertion with citation
  | "user_assertion" // explicit human claim, attributed
  | "reduction" // produced by the P-9 reduction process itself
  | "simulation" // sensitivity / divergence evidence from PRISM runs
  | "legacy"; // backfilled from rev 1.0 fields

export interface CorrelationEvidence {
  method: "pearson" | "spearman" | "kendall" | "mutual_information" | "other";
  statistic: number;
  pValue: number | null;
  sampleSize: number | null;
  datasetRef: string;
  /** Observed lag only; never asserted as lagSteps. */
  lagObserved?: number;
}

export interface ProvenanceEntry {
  id: string;
  sourceType: ProvenanceSourceType;
  createdAt: string; // ISO 8601
  createdBy: string; // module id or user id
  confidence: number; // 0..1, source-local
  sourceRefs: string[]; // citations, run ids, dataset ids
  note?: string;
  /** Required iff sourceType === "correlation". */
  correlation?: CorrelationEvidence;
}

// ─── Relationship status (rev 1.0 §3.2 — the seven statuses) ─────────────────
export type RelationshipStatus =
  | "unknown"
  | "candidate"
  | "assumed"
  | "active"
  | "inactive"
  | "prohibited"
  | "unsupported";

// ─── Query Manager request / response (spec §3.5) ────────────────────────────
export type ProvenanceAvailability = "available" | "unavailable";

export type RequestedArtifact = "objects" | "prism9" | "lope" | "provenance";

export interface QueryManagerRequest {
  query: string;
  /** One of the disease subjects; defaults to session/anon subject. */
  subject?: string;
  level: Level;
  currentFocus?: string;
  confidenceFloor?: number;
  requested?: RequestedArtifact[];
}

export interface QMObject {
  label: string;
  role: "subsystem" | "goal" | "peer";
  confidence: number;
  definition: string;
  /** OntologyLayer of this object; always ≤ the Level's layerMax. */
  layer: number;
}

export interface QMEdge {
  source: string;
  target: string;
  relation: string;
  /** influence until a validation/simulation step promotes to causal. */
  edgeKind: EdgeKind;
  status: RelationshipStatus;
  /** Summary confidence, derivable from provenance[] (Amendment A3.2(3)). */
  confidence: number;
  provenance: ProvenanceEntry[];
}

// A "route" in the Navigation Computer — a candidate strategy to reach the
// goal (LOPE/ExpDir surfaced in the TREE Navigation Helm metaphor).
export interface QMRoute {
  id: string; // "A".."E"
  strategy: string;
  successProbability: number; // 0..1
  timeMonths: number;
  costTier: 1 | 2 | 3 | 4; // $ .. $$$$
  risk: "low" | "med" | "high";
  evidenceStrength: number; // 0..1 (renders as bars)
}

export type GoalMode = "normal" | "dysfunction" | "cope" | "fix" | "discover";

export interface QueryManagerResponse {
  subject: string;
  confidence: number;
  level: Level;
  /** Echoes the applied Level depth (spec §3.5). */
  layerBound: number;
  /** Effective recenter focus (R4) — the node the graph is re-rooted on, if any. */
  focus?: string;
  objects: QMObject[];
  edges: QMEdge[];
  /** Navigation Computer pathways (omitted/short at Beginner). */
  routes?: QMRoute[];
  prism9Graph?: Record<string, unknown>;
  /** Omitted at Beginner. */
  lope?: unknown[];
  /** Honest flag — "unavailable" when GRAPH_AVAILABLE is false (spec §3.7). */
  provenance: ProvenanceAvailability;
  wikiCard?: Record<string, unknown>;
  /** Human-readable trace of plan decisions. */
  planNotes: string[];
  /** Whether the live ARS gateway answered, or we fell back to mock. */
  source: "gateway" | "mock";
}
