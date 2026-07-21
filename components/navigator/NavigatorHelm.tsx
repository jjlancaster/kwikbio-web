"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoalMode, Level, QueryManagerResponse } from "@/lib/ars-query";
import MissionControl from "./MissionControl";
import NavigationComputer from "./NavigationComputer";
import GraphRadar from "./GraphRadar";

// The 5 disease subjects (spec §2, Hydro-confirmed).
const SUBJECTS = [
  "RBC / MPN / PV",
  "Cystic Fibrosis",
  "Epilepsy",
  "Huntington's Disease",
  "Cancer",
] as const;

const LEVELS: { value: Level; label: string; dot: string }[] = [
  { value: "beginner", label: "Beginner", dot: "bg-emerald-400" },
  { value: "novice", label: "Novice", dot: "bg-amber-400" },
  { value: "pro", label: "Pro", dot: "bg-sky-400" },
];

// The TREE Navigation Helm — v4.2-feasible panels, Level-governed.
// Driven entirely by /api/ars-query/resolve (the Query Manager).
export default function NavigatorHelm() {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [level, setLevel] = useState<Level>("beginner");
  const [goalMode, setGoalMode] = useState<GoalMode>("fix");
  const [result, setResult] = useState<QueryManagerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ars-query/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: subject,
          subject,
          level,
          requested: ["objects", "prism9", "lope", "provenance"],
        }),
      });
      if (!res.ok) throw new Error(`resolve ${res.status}`);
      setResult((await res.json()) as QueryManagerResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "resolve failed");
    } finally {
      setLoading(false);
    }
  }, [subject, level]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <div className="min-h-screen bg-bio-navy px-4 py-5 text-slate-200 md:px-8">
      {/* Header / helm bar */}
      <header className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-bio-teal">
            <span className="font-semibold text-bio-gold">FS!7</span> Tree Navigation Helm
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">{result?.subject ?? subject}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Subject selector */}
          <label className="text-xs uppercase tracking-wide text-slate-400">
            System
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-bio-teal"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-bio-navy">
                  {s}
                </option>
              ))}
            </select>
          </label>

          {/* Level selector — governs graph depth AND panel density */}
          <div className="flex overflow-hidden rounded-md border border-white/10">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm transition ${
                  level === l.value ? "bg-bio-purple text-white" : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Panels — the v4.2-feasible three */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <MissionControl
          result={result}
          loading={loading}
          goalMode={goalMode}
          onGoalMode={setGoalMode}
        />
        <NavigationComputer routes={result?.routes ?? []} loading={loading} />
        <GraphRadar result={result} />
      </div>

      <footer className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-500">
        <span>
          <span className="text-slate-300">FastScience!</span> — Navigate. Discover. Heal.
        </span>
        {result && (
          <>
            <span>source: {result.source}</span>
            <span>
              provenance:{" "}
              <span className={result.provenance === "available" ? "text-emerald-400" : "text-amber-400"}>
                {result.provenance}
              </span>
            </span>
            <span>layer ≤ {result.layerBound}</span>
          </>
        )}
      </footer>
    </div>
  );
}
