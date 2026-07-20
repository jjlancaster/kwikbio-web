// Level → layer contract (Hydro-confirmed 2026-07-18; NAV-DESIGN-v1 + spec §3.4).
//
// The Level bound is applied at PLAN TIME, not as a post-hoc UI filter, so
// shallow Levels are genuinely cheaper/faster. maxObjects/maxEdges are the
// per-query plan cost ceiling that protects the Jewel/Hostinger CPU budget.

import type { Level, LevelPlan } from "./types";

export const LEVEL_PLANS: Record<Level, LevelPlan> = {
  beginner: {
    level: "beginner",
    layerMin: 0,
    layerMax: 1,
    showRawConfidence: false,
    includeLope: false,
    includeSskm: false,
    expandProvenance: false,
    maxObjects: 8,
    maxEdges: 12,
  },
  novice: {
    level: "novice",
    layerMin: 0,
    layerMax: 3,
    showRawConfidence: true,
    includeLope: true,
    includeSskm: false,
    expandProvenance: false,
    maxObjects: 20,
    maxEdges: 40,
  },
  pro: {
    level: "pro",
    layerMin: 0,
    layerMax: 5,
    showRawConfidence: true,
    includeLope: true,
    includeSskm: true,
    expandProvenance: true,
    maxObjects: 60,
    maxEdges: 150,
  },
};

/** Default Level for anonymous/first-query users — shallowest, cheapest plan. */
export const DEFAULT_ANON_LEVEL: Level = "beginner";

export function planForLevel(level: Level | undefined): LevelPlan {
  return (level && LEVEL_PLANS[level]) || LEVEL_PLANS[DEFAULT_ANON_LEVEL];
}
