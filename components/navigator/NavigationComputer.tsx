"use client";

import type { QMRoute } from "@/lib/ars-query";

function EvidenceBars({ strength }: { strength: number }) {
  const filled = Math.round(strength * 4);
  return (
    <span className="inline-flex gap-0.5" aria-label={`evidence ${filled}/4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`h-2.5 w-1.5 rounded-sm ${i < filled ? "bg-emerald-400" : "bg-white/15"}`} />
      ))}
    </span>
  );
}

const RISK_TONE: Record<QMRoute["risk"], string> = {
  low: "text-emerald-400",
  med: "text-amber-400",
  high: "text-red-400",
};

export default function NavigationComputer({ routes, loading }: { routes: QMRoute[]; loading: boolean }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Navigation Computer</h2>
        <span className="text-xs text-slate-500">Possible Pathways</span>
      </div>

      {loading && routes.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">resolving routes…</div>
      ) : routes.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No routes for this system yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="py-1.5 pr-2">Route</th>
                <th className="py-1.5 pr-2">Strategy</th>
                <th className="py-1.5 pr-2">Success</th>
                <th className="py-1.5 pr-2">Time</th>
                <th className="py-1.5 pr-2">Cost</th>
                <th className="py-1.5 pr-2">Risk</th>
                <th className="py-1.5">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-2 font-mono text-bio-teal">{r.id}</td>
                  <td className="py-2 pr-2 text-white">{r.strategy}</td>
                  <td className="py-2 pr-2">{Math.round(r.successProbability * 100)}%</td>
                  <td className="py-2 pr-2 text-slate-300">{r.timeMonths} mo.</td>
                  <td className="py-2 pr-2 text-bio-gold">{"$".repeat(r.costTier)}</td>
                  <td className={`py-2 pr-2 capitalize ${RISK_TONE[r.risk]}`}>{r.risk}</td>
                  <td className="py-2">
                    <EvidenceBars strength={r.evidenceStrength} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
