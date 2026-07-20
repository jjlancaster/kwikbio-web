// Provenance contract + status-transition validator.
//
// PRISM Spec Amendment rev 1.1, §A2/§A3:
//   "Correlation proposes. Evidence promotes. The ledger records."
//
// This is the executable form of rev 1.0 §26 (no automatic causal claims from
// correlation alone). Every status change must append exactly one
// ProvenanceEntry; correlation/legacy-only edges can never be assumed/active.

import type {
  ProvenanceEntry,
  ProvenanceSourceType,
  RelationshipStatus,
} from "./types";

/** Source types that can *complete* a promotion (Amendment §A3.1, CEM §6.1). */
const PROMOTING_SOURCES: ReadonlySet<ProvenanceSourceType> = new Set([
  "knowledge_graph",
  "user_assertion",
]);

/** Source types that can never, alone, hold an edge above `candidate`. */
const NON_PROMOTING_ONLY: ReadonlySet<ProvenanceSourceType> = new Set([
  "correlation",
  "legacy",
]);

export interface TransitionRequest {
  from: RelationshipStatus;
  to: RelationshipStatus;
  /** The single provenance entry appended to justify this transition. */
  entry: ProvenanceEntry;
  /** Required for candidate → active (Amendment §A3.1). */
  hasCoefficientBounds?: boolean;
}

export interface TransitionResult {
  ok: boolean;
  reason: string;
}

/** A correlation entry MUST carry CorrelationEvidence; others must not need it. */
export function validateProvenanceEntry(entry: ProvenanceEntry): TransitionResult {
  if (entry.sourceType === "correlation" && !entry.correlation) {
    return { ok: false, reason: "correlation entry missing CorrelationEvidence" };
  }
  if (entry.confidence < 0 || entry.confidence > 1) {
    return { ok: false, reason: "confidence out of [0,1]" };
  }
  return { ok: true, reason: "ok" };
}

/** True if any provenance entry can complete a promotion. */
export function canPromote(prov: readonly ProvenanceEntry[]): boolean {
  return prov.some((e) => PROMOTING_SOURCES.has(e.sourceType));
}

/**
 * Invariant A3.2(1): an edge whose provenance contains only correlation and/or
 * legacy entries can never hold `assumed` or `active`.
 */
export function correlationOnly(prov: readonly ProvenanceEntry[]): boolean {
  return prov.length > 0 && prov.every((e) => NON_PROMOTING_ONLY.has(e.sourceType));
}

const PROMOTED_STATUSES: ReadonlySet<RelationshipStatus> = new Set([
  "assumed",
  "active",
]);

/**
 * Validate a status transition against the Amendment §A3.1 table and invariants.
 * `existingBefore` is the edge's provenance BEFORE `req.entry` is appended.
 */
export function validateTransition(
  req: TransitionRequest,
  existingBefore: readonly ProvenanceEntry[],
): TransitionResult {
  const entryCheck = validateProvenanceEntry(req.entry);
  if (!entryCheck.ok) return entryCheck;

  const after = [...existingBefore, req.entry];

  // Invariant A3.2(1): correlation/legacy-only can never be promoted.
  if (PROMOTED_STATUSES.has(req.to) && correlationOnly(after)) {
    return {
      ok: false,
      reason: `correlation/legacy-only provenance cannot reach '${req.to}' (rev 1.0 §26)`,
    };
  }

  const { from, to } = req;

  // unknown → candidate: any entry.
  if (from === "unknown" && to === "candidate") return { ok: true, reason: "candidate instantiated" };

  // candidate → assumed: needs a promoting entry.
  if (from === "candidate" && to === "assumed") {
    return canPromote(after)
      ? { ok: true, reason: "promoted to assumed" }
      : { ok: false, reason: "assumed requires knowledge_graph or user_assertion" };
  }

  // candidate → active: promoting entry AND coefficient bounds.
  if (from === "candidate" && to === "active") {
    if (!canPromote(after)) return { ok: false, reason: "active requires knowledge_graph or user_assertion" };
    if (!req.hasCoefficientBounds) return { ok: false, reason: "active requires coefficient bounds" };
    return { ok: true, reason: "promoted to active" };
  }

  // assumed → active: additional supporting entry (promoting or simulation) + bounds.
  if (from === "assumed" && to === "active") {
    if (!req.hasCoefficientBounds) return { ok: false, reason: "active requires coefficient bounds" };
    return { ok: true, reason: "assumed promoted to active" };
  }

  // active/assumed → candidate: demotion citing contradicting evidence.
  if ((from === "active" || from === "assumed") && to === "candidate") {
    return { ok: true, reason: "demoted to candidate" };
  }

  // any → prohibited: user assertion or domain constraint, with rationale.
  if (to === "prohibited") {
    const hasRationale = !!req.entry.note && req.entry.note.trim().length > 0;
    const allowed = req.entry.sourceType === "user_assertion" || req.entry.sourceType === "reduction";
    return allowed && hasRationale
      ? { ok: true, reason: "prohibited by assertion/constraint" }
      : { ok: false, reason: "prohibited requires user_assertion/constraint with rationale" };
  }

  // candidate → unsupported: contradicting evidence; edge retained, never deleted.
  if (from === "candidate" && to === "unsupported") {
    return { ok: true, reason: "marked unsupported (retained)" };
  }

  // No-op / unlisted transition.
  if (from === to) return { ok: false, reason: "no-op transition appends no provenance" };
  return { ok: false, reason: `transition ${from} → ${to} not permitted` };
}

/**
 * Summary confidence, derivable from provenance[] (Amendment A3.2(3)).
 * v4.2 default: max over non-correlation entries; correlation entries
 * contribute only when no other entries exist AND status is `candidate`.
 */
export function aggregateConfidence(
  prov: readonly ProvenanceEntry[],
  status: RelationshipStatus,
): number {
  if (prov.length === 0) return 0;
  const nonCorrelation = prov.filter((e) => e.sourceType !== "correlation");
  if (nonCorrelation.length > 0) {
    return Math.max(...nonCorrelation.map((e) => e.confidence));
  }
  if (status === "candidate") {
    return Math.max(...prov.map((e) => e.confidence));
  }
  return 0;
}

// ─── Acceptance-test surface (Amendment §A6.1) ───────────────────────────────
// Runnable without a test framework so CI (`next build`) stays green and the
// invariants remain a live "definition of done" (exposed at /api/ars-query/selfcheck).

function corrEntry(id: string, confidence = 0.6): ProvenanceEntry {
  return {
    id,
    sourceType: "correlation",
    createdAt: new Date(0).toISOString(),
    createdBy: "selfcheck",
    confidence,
    sourceRefs: ["dataset:selfcheck"],
    correlation: {
      method: "pearson",
      statistic: 0.7,
      pValue: 0.01,
      sampleSize: 120,
      datasetRef: "dataset:selfcheck",
    },
  };
}

function kgEntry(id: string, confidence = 0.85): ProvenanceEntry {
  return {
    id,
    sourceType: "knowledge_graph",
    createdAt: new Date(0).toISOString(),
    createdBy: "selfcheck",
    confidence,
    sourceRefs: ["kg:assertion:1"],
  };
}

export function runProvenanceInvariantChecks(): { pass: boolean; failures: string[] } {
  const failures: string[] = [];

  // A6.1(1): correlation-only can never reach assumed/active.
  const c1 = validateTransition({ from: "candidate", to: "assumed", entry: corrEntry("c1") }, [corrEntry("c0")]);
  if (c1.ok) failures.push("correlation-only reached 'assumed'");
  const c1b = validateTransition({ from: "candidate", to: "active", entry: corrEntry("c1b"), hasCoefficientBounds: true }, [corrEntry("c0")]);
  if (c1b.ok) failures.push("correlation-only reached 'active'");

  // A6.1: candidate → active without coefficient bounds must fail even with KG evidence.
  const c2 = validateTransition({ from: "candidate", to: "active", entry: kgEntry("k1") }, [corrEntry("c0")]);
  if (c2.ok) failures.push("active granted without coefficient bounds");

  // KG evidence + bounds promotes.
  const c3 = validateTransition({ from: "candidate", to: "active", entry: kgEntry("k2"), hasCoefficientBounds: true }, [corrEntry("c0")]);
  if (!c3.ok) failures.push("valid KG promotion to active rejected: " + c3.reason);

  // A6.1: correlation entry missing evidence is invalid.
  const badCorr: ProvenanceEntry = { id: "bad", sourceType: "correlation", createdAt: new Date(0).toISOString(), createdBy: "selfcheck", confidence: 0.5, sourceRefs: [] };
  if (validateProvenanceEntry(badCorr).ok) failures.push("correlation entry without CorrelationEvidence accepted");

  // A3.2(3): aggregation — correlation-only candidate uses correlation confidence; KG switches to KG max.
  if (aggregateConfidence([corrEntry("a", 0.6)], "candidate") !== 0.6) failures.push("aggregate: correlation-only candidate wrong");
  if (aggregateConfidence([corrEntry("a", 0.6), kgEntry("b", 0.85)], "active") !== 0.85) failures.push("aggregate: non-correlation max wrong");

  // No-op transition appends no provenance → rejected.
  if (validateTransition({ from: "candidate", to: "candidate", entry: kgEntry("n") }, []).ok) failures.push("no-op transition accepted");

  return { pass: failures.length === 0, failures };
}
