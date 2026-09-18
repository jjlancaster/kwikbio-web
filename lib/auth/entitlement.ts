// M-AUTH — the entitlement table: account tier → maximum usable Level.
//
// This is the SERVER-SIDE authority. `components/Entitlement.tsx` renders the
// same answer in the browser, but a client value is an affordance, not a
// control: anything that actually costs money or reveals depth must call
// `maxLevelFor()` on the server before it answers.
//
// BOUNDARY: this file may import ARS Core types (`lib/ars-query`) but ARS Core
// must never import this — entitlement is arena policy, not query semantics.

import type { Level } from "@/lib/ars-query";

/** Consumer entitlement tier (what was bought). Distinct from staff `role`. */
export type Tier = "anonymous" | "freemium" | "subscriber" | "enterprise";

/** Staff/internal RBAC, mirroring hydrojoule. NOT a product entitlement. */
export type Role = "SUBSCRIBER" | "RESEARCHER" | "ADMIN";

export type AgeBand = "adult" | "minor";

// ─── The pricing knob ────────────────────────────────────────────────────────
// One table, one line per tier. Changing what a tier is worth is an edit here
// and nowhere else.
//
//   anonymous  → Easy. The open Wikipedia/Google-style path (R1). Never gated.
//   freemium   → Novice. What signing up actually buys; the conversion step
//                between "see what you're missing" and paying.
//   subscriber → Pro. Full depth.
//   enterprise → Pro, plus private data models / private POD (Terms §5.3).
export const TIER_MAX_LEVEL: Record<Tier, Level> = {
  anonymous: "beginner",
  freemium: "novice",
  subscriber: "pro",
  enterprise: "pro",
};

/** Level difficulty order — must match the ski-trail progression. */
export const LEVEL_RANK: Record<Level, number> = { beginner: 0, novice: 1, pro: 2 };

export interface AccountEntitlement {
  tier: Tier;
  ageBand?: AgeBand | null;
  /** Set only when a guardian or institution holds the seat for a minor. */
  guardianConfirmed?: boolean;
}

/**
 * The maximum Level this account may actually use.
 *
 * Minors are the one place tier alone is not the answer: a minor cannot
 * contract (Terms §2), so a paid tier only counts when a guardian or
 * institution is on record as holding the seat. Absent that, a minor account
 * falls back to the freemium ceiling rather than the tier it claims — which
 * fails closed if a checkout ever writes a tier it shouldn't have.
 */
export function maxLevelFor(account: AccountEntitlement | null | undefined): Level {
  if (!account) return TIER_MAX_LEVEL.anonymous;

  const paid = account.tier === "subscriber" || account.tier === "enterprise";
  if (paid && account.ageBand === "minor" && !account.guardianConfirmed) {
    return TIER_MAX_LEVEL.freemium;
  }
  return TIER_MAX_LEVEL[account.tier] ?? TIER_MAX_LEVEL.anonymous;
}

/** True when `level` sits above what this account is entitled to. */
export function isLevelLocked(account: AccountEntitlement | null | undefined, level: Level): boolean {
  return LEVEL_RANK[level] > LEVEL_RANK[maxLevelFor(account)];
}

/**
 * Whether this account may buy a subscription for itself.
 * Minors cannot contract — the guardian or institution is the contracting
 * party and payer (Terms §2). Unknown age is treated as "not yet allowed":
 * the age gate has to answer before money changes hands.
 */
export function maySelfPurchase(account: AccountEntitlement | null | undefined): boolean {
  return account?.ageBand === "adult";
}

/** SciCrush is 18+, unconditionally — no guardian override (Terms §7). */
export function mayAccessSciCrush(account: AccountEntitlement | null | undefined): boolean {
  return account?.ageBand === "adult";
}
