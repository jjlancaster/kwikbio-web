"use client";

// U1 — the Level badge (spec §5: "Level badge → Query Manager `layer` bound.
// Persistent, one-tap, no session restart"). A three-state control bound to the
// app-wide Level (LevelProvider). Changing it re-plans depth on the next query;
// it never sets graph depth directly — it only sets `level`.

import { useLevel } from "./LevelProvider";
import type { Level } from "@/lib/ars-query";

const LEVELS: { value: Level; label: string; short: string; dot: string }[] = [
  { value: "beginner", label: "Beginner", short: "Beg", dot: "bg-emerald-400" },
  { value: "novice", label: "Novice", short: "Nov", dot: "bg-amber-400" },
  { value: "pro", label: "Pro", short: "Pro", dot: "bg-sky-400" },
];

export default function LevelBadge({ className = "" }: { className?: string }) {
  const { level, setLevel } = useLevel();

  return (
    <div
      role="radiogroup"
      aria-label="Research Level"
      title="Level sets query depth (Beginner 0–1 · Novice 2–3 · Pro 4–5)"
      className={`flex overflow-hidden rounded-md border border-white/10 ${className}`}
    >
      {LEVELS.map((l) => {
        const active = level === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLevel(l.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition ${
              active
                ? "bg-bio-purple text-white"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${l.dot}`} />
            <span className="hidden sm:inline">{l.label}</span>
            <span className="sm:hidden">{l.short}</span>
          </button>
        );
      })}
    </div>
  );
}
