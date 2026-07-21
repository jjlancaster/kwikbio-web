// ars-query — Query Manager (ARS Core module, patent figure 206).
// Public surface. Import from "@/lib/ars-query" (or relative) — not from files directly.

export * from "./types";
export { LEVEL_PLANS, DEFAULT_ANON_LEVEL, planForLevel } from "./levels";
export {
  validateTransition,
  validateProvenanceEntry,
  canPromote,
  correlationOnly,
  aggregateConfidence,
  runProvenanceInvariantChecks,
} from "./provenance";
export type { TransitionRequest, TransitionResult } from "./provenance";
export { resolveQuery } from "./resolve";
export { fetchEngineSnapshot } from "./engine";
export type { EngineSnapshot } from "./engine";
