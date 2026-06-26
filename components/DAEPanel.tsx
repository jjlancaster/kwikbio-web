"use client";
import { useState } from "react";

interface Triple { subject: string; predicate: string; object: string; confidence: number; }
interface DAEResult {
  sessionId: string;
  triples: Triple[];
  summary: string;
  confidenceLevel: "green" | "yellow" | "red";
  anomalies: string[];
  voiDelta: number;
  writtenToARS: boolean;
}

const CONF_STYLE: Record<string, string> = {
  green:  "text-green-400 border-green-400/30 bg-green-400/10",
  yellow: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  red:    "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function DAEPanel({ sessionId }: { sessionId?: string }) {
  const [rawResults, setRawResults] = useState("");
  const [result, setResult] = useState<DAEResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!rawResults.trim()) return;
    setLoading(true);
    const resp = await fetch("/api/dae", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawResults, sessionId }),
    });
    setResult(await resp.json());
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <textarea
          className="w-full h-28 p-3 text-sm border border-slate-700 rounded-lg bg-bio-navy/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bio-teal resize-none"
          placeholder="Paste raw experimental results (lab report, data summary, observations)…"
          value={rawResults}
          onChange={(e) => setRawResults(e.target.value)}
        />
        <button onClick={analyze} disabled={loading || !rawResults.trim()}
          className="mt-2 px-4 py-2 bg-bio-purple text-white font-semibold text-sm rounded-md hover:opacity-90 disabled:opacity-50">
          {loading ? "Analyzing…" : "Analyze Results (DAE)"}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${CONF_STYLE[result.confidenceLevel]}`}>
              {result.confidenceLevel.toUpperCase()} confidence
            </span>
            <span className="text-xs text-slate-400">
              VOI Δ: <span className={result.voiDelta >= 0 ? "text-green-400" : "text-red-400"}>
                {result.voiDelta >= 0 ? "+" : ""}{result.voiDelta.toFixed(3)}
              </span>
            </span>
            {result.writtenToARS && (
              <span className="text-xs text-bio-teal">✓ Written to ARS</span>
            )}
          </div>

          <p className="text-sm text-slate-300">{result.summary}</p>

          {result.anomalies.length > 0 && (
            <div className="p-2 rounded border border-yellow-400/30 bg-yellow-400/5">
              <p className="text-xs font-semibold text-yellow-400 mb-1">Anomalies detected</p>
              {result.anomalies.map((a, i) => (
                <p key={i} className="text-xs text-slate-400">{a}</p>
              ))}
            </div>
          )}

          {result.triples.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-xs text-slate-300">
                <thead className="bg-bio-navy/80 text-slate-400 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Predicate</th>
                    <th className="px-3 py-2 text-left">Object</th>
                    <th className="px-3 py-2 text-right">Conf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {result.triples.map((t, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-bio-teal">{t.subject}</td>
                      <td className="px-3 py-2 italic text-slate-400">{t.predicate}</td>
                      <td className="px-3 py-2">{t.object}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span className={t.confidence >= 0.7 ? "text-green-400" : t.confidence >= 0.4 ? "text-yellow-400" : "text-red-400"}>
                          {(t.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
