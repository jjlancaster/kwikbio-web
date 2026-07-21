"use client";

import type { GoalMode, QueryManagerResponse } from "@/lib/ars-query";

const GOAL_MODES: { value: GoalMode; label: string; hint: string }[] = [
  { value: "normal", label: "Normal", hint: "Achieve Healthy Function" },
  { value: "dysfunction", label: "Dysfunction", hint: "Understand Breakdown" },
  { value: "cope", label: "Cope", hint: "Live Well with Condition" },
  { value: "fix", label: "Fix", hint: "Restore / Improve" },
  { value: "discover", label: "Discover", hint: "Explore Unknowns" },
];

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

export default function MissionControl({
  result,
  loading,
  goalMode,
  onGoalMode,
}: {
  result: QueryManagerResponse | null;
  loading: boolean;
  goalMode: GoalMode;
  onGoalMode: (m: GoalMode) => void;
}) {
  const confidence = result?.confidence ?? 0;
  const voi = result ? (result.provenance === "available" ? "High" : "Indeterminate (provenance dark)") : "—";

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Mission Control</h2>
        {loading && <span className="text-xs text-bio-teal">resolving…</span>}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-400">System</dt>
          <dd className="text-white">{result?.subject ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Level</dt>
          <dd className="capitalize text-white">{result?.level ?? "—"}</dd>
        </div>
        <div>
          <div className="mb-1 flex justify-between">
            <dt className="text-slate-400">Confidence</dt>
            <dd className="text-white">{Math.round(confidence * 100)}%</dd>
          </div>
          <Bar value={confidence} tone="bg-bio-teal" />
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Value of Information</dt>
          <dd className={result?.provenance === "available" ? "text-emerald-400" : "text-amber-400"}>{voi}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Provenance</dt>
          <dd className={result?.provenance === "available" ? "text-emerald-400" : "text-amber-400"}>
            {result?.provenance ?? "—"}
          </dd>
        </div>
      </dl>

      {/* Goal Mode selector (from the Helm mockup) */}
      <div className="mt-4">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Goal Mode</div>
        <div className="grid grid-cols-1 gap-1.5">
          {GOAL_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => onGoalMode(m.value)}
              className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-sm transition ${
                goalMode === m.value
                  ? "border-bio-gold/60 bg-bio-gold/10 text-white"
                  : "border-white/10 bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-medium">{m.label}</span>
              <span className="text-xs text-slate-500">{m.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
