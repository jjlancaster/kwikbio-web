"use client";
import { useState } from "react";
import VizSim from "./VizSim";

interface KTuple { subject: string; predicate: string; object: string; confidence: number; }
interface GraphNode { id: string; name: string; type: string; activation?: number; }
interface GraphEdge { source: string; target: string; relation: string; weight: number; }
interface SlamResult {
  sessionId: string;
  kTuples: KTuple[];
  causalGraph: { nodes: GraphNode[]; edges: GraphEdge[] };
  simulation: {
    trajectory: { timepoints: number[]; states: Record<string, number[]> };
    steadyState: Record<string, number>;
    converged: boolean;
  };
  confidence: number;
}

type Tab = "tuples" | "graph" | "sim";

export default function SlamPanel({ query }: { query: string }) {
  const [result, setResult] = useState<SlamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("tuples");

  async function run() {
    if (!query.trim()) return;
    setLoading(true); setError("");
    try {
      const resp = await fetch("/api/slam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!resp.ok) throw new Error(`SLAM ${resp.status}`);
      setResult(await resp.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["tuples", "graph", "sim"];
  const tabLabel: Record<Tab, string> = { tuples: "K-Tuples", graph: "Causal Graph", sim: "Simulation" };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <button onClick={run} disabled={loading || !query.trim()}
          className="px-4 py-2 bg-bio-purple text-white font-semibold text-sm rounded-md hover:opacity-90 disabled:opacity-50">
          {loading ? "Running SLAM…" : "Run SLAM Pipeline"}
        </button>
        {result && (
          <span className="text-xs text-slate-400">
            Conf: <span className="text-bio-gold font-mono">{(result.confidence * 100).toFixed(1)}%</span>
            {" · "}{result.kTuples.length} k-tuples
            {" · "}{result.causalGraph.nodes.length} nodes
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {result && (
        <>
          <div className="flex gap-1 border-b border-slate-700">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t ? "text-bio-teal border-b-2 border-bio-teal" : "text-slate-400 hover:text-slate-200"
                }`}>
                {tabLabel[t]}
              </button>
            ))}
          </div>

          {tab === "tuples" && (
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
                  {result.kTuples.map((t, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-3 py-2 text-bio-teal">{t.subject}</td>
                      <td className="px-3 py-2 italic text-slate-400">{t.predicate}</td>
                      <td className="px-3 py-2 text-bio-teal">{t.object}</td>
                      <td className="px-3 py-2 text-right font-mono text-green-400">
                        {(t.confidence * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "graph" && (
            <VizSim nodes={result.causalGraph.nodes} edges={result.causalGraph.edges} />
          )}

          {tab === "sim" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  result.simulation.converged
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {result.simulation.converged ? "Converged" : "Max steps reached"}
                </span>
                <span className="text-xs text-slate-400">
                  {result.simulation.trajectory.timepoints.length} steps
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Steady State</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.simulation.steadyState).map(([nodeId, val]) => {
                  const node = result.causalGraph.nodes.find((n) => n.id === nodeId);
                  return (
                    <div key={nodeId}
                      className="flex justify-between px-3 py-2 rounded bg-bio-navy/30 border border-slate-700">
                      <span className="text-xs text-slate-300">{node?.name ?? nodeId}</span>
                      <span className="text-xs font-mono text-bio-gold">{val.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
