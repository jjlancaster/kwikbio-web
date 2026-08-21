"use client";

// R1 — Freemium entitlement. Anonymous users get the open knowledge search at
// Easy (like Wikipedia/Google); Novice and Pro are LOCKED but visible, so the
// user can see what they're missing and one tap reveals the upgrade path.
//
// This is the single seam where real account tiers plug in later: today there is
// no auth, so everyone is anonymous → Easy. When auth lands, pass the account's
// entitled maxLevel into <EntitlementProvider maxLevel={…}>.

import { createContext, useCallback, useContext, useState } from "react";
import type { Level } from "@/lib/ars-query";
import UpgradePrompt from "./UpgradePrompt";

// Level difficulty order (must match the ski-trail progression).
export const LEVEL_RANK: Record<Level, number> = { beginner: 0, novice: 1, pro: 2 };

// Anonymous / Freemium ceiling: Easy only.
export const ANON_MAX_LEVEL: Level = "beginner";

interface EntitlementValue {
  /** Highest Level the current (anon/tier) user may actually use. */
  maxLevel: Level;
  /** True if `level` is above the user's entitlement (locked). */
  isLocked: (level: Level) => boolean;
  /** Open the upgrade prompt for a locked level. */
  requestUnlock: (level: Level) => void;
}

const Ctx = createContext<EntitlementValue | null>(null);

export function EntitlementProvider({
  children,
  maxLevel = ANON_MAX_LEVEL,
}: {
  children: React.ReactNode;
  maxLevel?: Level;
}) {
  const [promptLevel, setPromptLevel] = useState<Level | null>(null);

  const isLocked = useCallback(
    (level: Level) => LEVEL_RANK[level] > LEVEL_RANK[maxLevel],
    [maxLevel]
  );
  const requestUnlock = useCallback((level: Level) => setPromptLevel(level), []);

  return (
    <Ctx.Provider value={{ maxLevel, isLocked, requestUnlock }}>
      {children}
      <UpgradePrompt
        open={promptLevel !== null}
        lockedLevel={promptLevel}
        maxLevel={maxLevel}
        onClose={() => setPromptLevel(null)}
      />
    </Ctx.Provider>
  );
}

export function useEntitlement(): EntitlementValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEntitlement must be used within <EntitlementProvider>");
  return c;
}
