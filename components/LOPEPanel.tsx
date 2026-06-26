"use client";
import { useEffect, useState } from "react";

interface Experiment {
  id: string;
  title: string;
  description: string;
  domain: string;
  expected_confidence_gain: number;
  voi_weight: number;
  estimated_cost_usd: number;
  status: string;
}

export default function LOPEPanel({
  hypothesisId,
  onSubmit,
}: {
  hypothesisId?: string;
  onSubmit?: (experimentId: string) => void;
}) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => { load(); }, [search]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (search) params.set("search", search);
    const resp = await fetch(`/api/lope?${params}`);
    const data = await resp.json();
    setExperiments(data.experiments ?? []);
    setLoading(false);
  }

  async function submit(exp: Experiment) {
    if (!hypothesisId) return;
    setSubmitting(exp.id);
    await fetch("/api/marketplace/experiments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentId: exp.id, hypothesisId }),
    });
    setSubmitting(null);
    onSubmit?.(exp.id);
  }

  return (
    <div className="space-y-3">
      <input
        className="w-full text-sm p-2 rounded border border-slate-700 bg-bio-navy/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-bio-teal"
        placeholder="Search LOPE experiments…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="text-sm text-slate-500">Loading LOPE…</p>
      ) : experiments.length === 0 ? (
        <p className="text-sm text-slate-500">No experiments found. Seed data runs automatically on first Supabase deploy.</p>
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <div key={exp.id} className="p-3 rounded-lg border border-slate-700 bg-bio-navy/20">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-200">{exp.title}</span>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.description}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                    <span>ECG: <span className="text-green-400">{(exp.expected_confidence_gain * 100).toFixed(0)}%</span></span>
                    <span>VOI wt: <span className="text-bio-gold">{exp.voi_weight.toFixed(2)}</span></span>
                    <span>Cost: <span className="text-slate-300">${exp.estimated_cost_usd.toLocaleString()}</span></span>
                  </div>
                </div>
                {hypothesisId && (
                  <button onClick={() => submit(exp)} disabled={submitting === exp.id}
                    className="ml-3 shrink-0 text-xs px-2 py-1 bg-bio-purple text-white rounded hover:opacity-90 disabled:opacity-50">
                    {submitting === exp.id ? "…" : "Select"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
