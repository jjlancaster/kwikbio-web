"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoalMode, QueryManagerResponse } from "@/lib/ars-query";
import { useLevel } from "@/components/LevelContext";
import LevelBadge from "@/components/LevelBadge";
import MissionControl from "./MissionControl";
import NavigationComputer from "./NavigationComputer";
import GraphRadar from "./GraphRadar";
import Prism9Popup from "./Prism9Popup";

// The 5 disease subjects (spec §2, Hydro-confirmed).
const SUBJECTS = [
  "RBC / MPN / PV",
  "Cystic Fibrosis",
  "Epilepsy",
  "Huntington's Disease",
  "Cancer",
] as const;

// The TREE Navigation Helm — v4.2-feasible panels, Level-governed.
// Driven entirely by /api/ars-query/resolve (the Query Manager).
export default function NavigatorHelm() {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  // Level is the app-wide persistent control (shared with the nav badge), so the
  // helm selector and the global badge stay in sync and survive navigation.
  const { level } = useLevel();
  const [goalMode, setGoalMode] = useState<GoalMode>("fix");
  const [result, setResult] = useState<QueryManagerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Prism9 entry flow (U2): popup cluster at Level depth → land / launch flight.
  const [prism9Open, setPrism9Open] = useState(false);
  const [flightNotice, setFlightNotice] = useState<string | null>(null);
  // Recenter (R4): re-root the cluster on a node/predicate via current_focus.
  const [focus, setFocus] = useState<string | null>(null);

  const onRecenter = useCallback((label: string | null) => setFocus(label), []);

  const onLaunchFlight = useCallback((nodeLabel: string | null) => {
    setPrism9Open(false);
    setFlightNotice(
      nodeLabel
        ? `Landed on “${nodeLabel}”. Full 3D free-flight is Navigator Layer 1 (Three.js) — next up.`
        : "Navigator flight — 3D Layer 1 (Three.js) is next; explore the cluster in 2D for now."
    );
  }, []);

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
          current_focus: focus ?? undefined,
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
  }, [subject, level, focus]);

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
              onChange={(e) => {
                setSubject(e.target.value);
                setFocus(null); // recenter is per-subject
              }}
              className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-bio-teal"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-bio-navy">
                  {s}
                </option>
              ))}
            </select>
          </label>

          {/* Level selector — governs graph depth AND panel density. Shared
              LevelBadge (ski-trail markers), bound to the app-wide Level so the
              helm and the global nav badge stay in sync. */}
          <LevelBadge />

          {/* Prism9 entry flow (U2): open the ResearchCluster at Level depth. */}
          <button
            type="button"
            onClick={() => setPrism9Open(true)}
            disabled={!result || (result.objects?.length ?? 0) === 0}
            className="rounded-md border border-bio-teal/40 bg-bio-teal/10 px-3 py-1.5 text-sm font-medium text-bio-teal transition hover:bg-bio-teal/20 disabled:opacity-40"
          >
            ◎ Prism9 Cluster
          </button>
        </div>
      </header>

      {flightNotice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-bio-teal/30 bg-bio-teal/10 px-3 py-2 text-sm text-bio-teal">
          <span>{flightNotice}</span>
          <button
            type="button"
            onClick={() => setFlightNotice(null)}
            aria-label="Dismiss"
            className="text-bio-teal/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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

      <Prism9Popup
        result={result}
        open={prism9Open}
        loading={loading}
        focus={focus}
        onClose={() => setPrism9Open(false)}
        onRecenter={onRecenter}
        onLaunchFlight={onLaunchFlight}
      />
    </div>
  );
}
