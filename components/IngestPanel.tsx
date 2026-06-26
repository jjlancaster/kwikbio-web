"use client";
import { useState } from "react";

interface Triple {
  subject: string;
  predicate: string;
  object: string;
  confidence?: number;
}

export default function IngestPanel() {
  const [text, setText] = useState("");
  const [triples, setTriples] = useState<Triple[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandTerm, setExpandTerm] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);

  async function ingest() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      setTriples(data.triples ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function expand() {
    if (!expandTerm.trim()) return;
    const resp = await fetch(`/api/ingest/expand?term=${encodeURIComponent(expandTerm)}`);
    const data = await resp.json();
    setExpanded(data.terms ?? []);
  }

  const confClass = (c?: number) =>
    (c ?? 0) >= 0.7 ? "text-green-400" : (c ?? 0) >= 0.4 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      <div>
        <textarea
          className="w-full h-32 p-3 text-sm border border-slate-700 rounded-lg bg-bio-navy/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bio-teal resize-none"
          placeholder="Paste scientific text to extract knowledge graph triples…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={ingest}
          disabled={loading || !text.trim()}
          className="mt-2 px-4 py-2 bg-bio-teal text-bio-navy font-semibold text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Extracting…" : "Extract Triples"}
        </button>
      </div>

      {triples.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-bio-gold mb-2">{triples.length} triples extracted</h3>
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
                {triples.map((t, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-3 py-2 cursor-pointer text-bio-teal hover:underline"
                      onClick={() => { setExpandTerm(t.subject); setExpanded([]); }}>
                      {t.subject}
                    </td>
                    <td className="px-3 py-2 italic text-slate-400">{t.predicate}</td>
                    <td className="px-3 py-2 cursor-pointer text-bio-teal hover:underline"
                      onClick={() => { setExpandTerm(t.object); setExpanded([]); }}>
                      {t.object}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-mono ${confClass(t.confidence)}`}>
                        {((t.confidence ?? 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {expandTerm && (
        <div className="p-3 rounded-lg bg-bio-navy/30 border border-slate-700">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-xs text-slate-400">Expand:</span>
            <span className="text-xs font-mono text-bio-teal">{expandTerm}</span>
            <button onClick={expand}
              className="text-xs px-2 py-0.5 bg-bio-purple text-white rounded hover:opacity-90">
              Get related terms
            </button>
          </div>
          {expanded.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {expanded.map((term, i) => (
                <button key={i}
                  onClick={() => setText((p) => p + "\n" + term)}
                  className="text-xs px-2 py-1 rounded-full border border-bio-teal/50 text-bio-teal hover:bg-bio-teal/10">
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
