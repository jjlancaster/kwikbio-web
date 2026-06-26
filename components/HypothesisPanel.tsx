"use client";
import { useEffect, useState } from "react";

interface Hypothesis {
  id: string;
  title: string;
  description: string;
  domain: string;
  confidence: number;
  voi_score: number;
  relevance: number;
  status: string;
}

export default function HypothesisPanel({ onSelect }: { onSelect?: (h: Hypothesis) => void }) {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", domain: "drug" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const resp = await fetch("/api/hypotheses?status=active&limit=20");
    const data = await resp.json();
    setHypotheses(data.hypotheses ?? []);
    setLoading(false);
  }

  async function create() {
    if (!form.title || !form.description) return;
    await fetch("/api/hypotheses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm({ title: "", description: "", domain: "drug" });
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-bio-gold">Active Hypotheses</h3>
        <button onClick={() => setCreating((v) => !v)}
          className="text-xs px-2 py-1 border border-bio-purple text-bio-purple rounded hover:bg-bio-purple/10">
          + New
        </button>
      </div>

      {creating && (
        <div className="p-3 rounded-lg border border-bio-purple/40 bg-bio-purple/10 space-y-2">
          <input
            className="w-full text-sm p-2 rounded border border-slate-700 bg-bio-navy/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-bio-teal"
            placeholder="Hypothesis title…"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="w-full text-sm p-2 rounded border border-slate-700 bg-bio-navy/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-bio-teal h-20 resize-none"
            placeholder="Description…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <select
            className="text-sm p-2 rounded border border-slate-700 bg-bio-navy text-slate-200 focus:outline-none"
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}>
            {["drug", "bioenergy", "climate", "rare", "custom"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={create}
              className="text-xs px-3 py-1 bg-bio-teal text-bio-navy font-semibold rounded">Create</button>
            <button onClick={() => setCreating(false)}
              className="text-xs px-3 py-1 border border-slate-600 text-slate-400 rounded">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : hypotheses.length === 0 ? (
        <p className="text-sm text-slate-500">No active hypotheses. Create one above or run a SLAM query first.</p>
      ) : (
        <div className="space-y-2">
          {hypotheses.map((h) => (
            <div key={h.id} onClick={() => onSelect?.(h)}
              className="p-3 rounded-lg border border-slate-700 bg-bio-navy/20 hover:border-bio-teal/50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-slate-200 leading-tight">{h.title}</span>
                <span className="ml-2 shrink-0 text-xs font-mono px-1.5 py-0.5 rounded bg-bio-purple/20 text-bio-gold">
                  VOI {h.voi_score.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{h.description}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                <span>conf: <span className="text-slate-300">{(h.confidence * 100).toFixed(0)}%</span></span>
                <span>domain: <span className="text-slate-300">{h.domain}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
