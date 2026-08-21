"use client";

// The persistent Level badge (U1 + R1). ALL THREE markers show at all times —
// one active, the others as alternative paths forward. The active Level is the
// app-wide LevelContext value that every /api/ars-query/resolve call sends as
// `level`; the Query Manager binds it to an OntologyLayer depth at plan time
// (spec §3.4). Changing level shifts research depth and available pathways.
//
// R1 (freemium): levels above the user's entitlement render LOCKED — visible so
// the user sees what they're missing, but tapping one opens the upgrade prompt
// instead of switching. The active level is clamped to the entitlement.
//
// Markers follow international ski-trail difficulty (green circle · blue square
// · black diamond), the CAST/UDL adaptive-learning convention.

import { useEffect } from "react";
import { LEVEL_META, LevelSymbol } from "./LevelSymbol";
import { useLevel } from "./LevelContext";
import { LEVEL_RANK, useEntitlement } from "./Entitlement";

export default function LevelBadge({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useLevel();
  const { maxLevel, isLocked, requestUnlock } = useEntitlement();

  // Clamp: a persisted level above the entitlement (e.g. a former Pro who is now
  // anonymous) drops back to the entitled ceiling, so resolve never runs locked.
  useEffect(() => {
    if (LEVEL_RANK[level] > LEVEL_RANK[maxLevel]) setLevel(maxLevel);
  }, [level, maxLevel, setLevel]);

  return (
    <div
      role="radiogroup"
      aria-label="Research Level"
      title="Level sets research depth and available pathways (spec §3.4)"
      className="flex items-center overflow-hidden rounded-md border border-white/10"
    >
      {LEVEL_META.map((l) => {
        const active = level === l.value;
        const locked = isLocked(l.value);
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={locked ? `${l.label} (locked — tap to unlock)` : l.label}
            onClick={() => (locked ? requestUnlock(l.value) : setLevel(l.value))}
            title={locked ? `${l.label} — unlock to go deeper` : l.hint}
            className={`flex items-center gap-1.5 transition ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            } ${
              active
                ? "bg-bio-purple text-white"
                : locked
                ? "text-slate-500 hover:bg-white/5"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {/* Symbol always full colour; locked levels are dimmed + get a lock. */}
            <span className={locked ? "opacity-60" : ""}>
              <LevelSymbol shape={l.shape} />
            </span>
            <span className={compact ? "hidden sm:inline" : ""}>{l.label}</span>
            {locked && (
              <span aria-hidden className="text-[10px] leading-none">
                🔒
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
