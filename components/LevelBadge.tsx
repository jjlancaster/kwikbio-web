"use client";

// The persistent Level badge (U1). One-tap Beginner / Novice / Pro. Sets the
// app-wide Level (LevelContext) that every /api/ars-query/resolve call sends as
// `level` — the Query Manager binds it to an OntologyLayer depth at plan time
// (spec §3.4). Dot colors match the Navigator helm: 🟢 / 🟡 / 🔵.

import type { Level } from "@/lib/ars-query";
import { useLevel } from "./LevelContext";

const LEVELS: { value: Level; label: string; dot: string; hint: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    dot: "bg-emerald-400",
    hint: "Layers 0–1 · plain-language, shallow graph",
  },
  {
    value: "novice",
    label: "Novice",
    dot: "bg-amber-400",
    hint: "Layers 0–3 · terminology + confidence",
  },
  {
    value: "pro",
    label: "Pro",
    dot: "bg-sky-400",
    hint: "Layers 0–5 · full depth, provenance, LOPE/SSKM",
  },
];

export default function LevelBadge({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useLevel();
  return (
    <div
      role="radiogroup"
      aria-label="Research Level"
      title="Level sets the graph depth the Query Manager plans (spec §3.4)"
      className="flex overflow-hidden rounded-md border border-white/10"
    >
      {LEVELS.map((l) => {
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
              compact ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
            } ${
              active
                ? "bg-bio-purple text-white"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${l.dot}`} />
            <span className={compact ? "hidden sm:inline" : ""}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
