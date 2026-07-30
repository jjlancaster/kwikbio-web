"use client";

// The persistent Level badge (U1). ALL THREE markers show at all times — one
// active, the other two as alternative paths forward (one tap to switch). The
// active Level is the app-wide LevelContext value that every
// /api/ars-query/resolve call sends as `level`; the Query Manager binds it to an
// OntologyLayer depth at plan time (spec §3.4). Changing level shifts the depth
// of analysis and the research pathways available.
//
// Markers follow international ski-trail difficulty (green circle · blue square
// · black diamond), the CAST/UDL adaptive-learning convention.

import { LEVEL_META, LevelSymbol } from "./LevelSymbol";
import { useLevel } from "./LevelContext";

export default function LevelBadge({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useLevel();
  return (
    <div
      role="radiogroup"
      aria-label="Research Level"
      title="Level sets research depth and available pathways (spec §3.4)"
      className="flex items-center overflow-hidden rounded-md border border-white/10"
    >
      {LEVEL_META.map((l) => {
        const active = level === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={l.label}
            onClick={() => setLevel(l.value)}
            title={l.hint}
            className={`flex items-center gap-1.5 transition ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            } ${
              active
                ? "bg-bio-purple text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {/* Symbol always at full colour so the marker stays recognizable
                even for the inactive (alternative-path) levels. */}
            <LevelSymbol shape={l.shape} />
            <span className={compact ? "hidden sm:inline" : ""}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
