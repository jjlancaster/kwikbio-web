"use client";

// TODO: wire to live ARS SSE stream at http://127.0.0.1:5000/v1/query on Jewel
// The /api/ars/query and /api/ars/explain Next.js routes are the current mock proxies.

import { useState, useRef } from "react";
import ARSResultCard, { ARSResultCardProps } from "./ARSResultCard";

const BRANCHES = [
  {
    k: "drug",
    t: "Drug Discovery",
    d: "Target ID, hit-to-lead, mechanism-of-action. Graph: ChEMBL + PubChem + private library.",
    sample: "Which kinase targets co-cluster with TNF-α in autoimmune signaling cascades?",
    icon: "🧬",
  },
  {
    k: "climate",
    t: "Climate & Carbon",
    d: "Carbon-cycle feedbacks, soil microbiome modeling, marine sequestration pathways.",
    sample: "What soil microbial consortia most reliably stabilize biochar carbon over 10-year horizons?",
    icon: "🌍",
  },
  {
    k: "bioenergy",
    t: "Bioenergy",
    d: "Microbial consortia for fuel synthesis, metabolic pathway optimization, feedstock matching.",
    sample: "Which two-organism consortia maximize methane yield from corn-stover digestate?",
    icon: "⚡",
  },
  {
    k: "rare",
    t: "Rare Disease",
    d: "Patient-registry mining, orphan-target prioritization, repurposing candidates.",
    sample: "Which approved drugs share mechanism overlap with NPC1 dysfunction in Niemann–Pick Type C?",
    icon: "🔬",
  },
  {
    k: "custom",
    t: "Custom Research",
    d: "Bring your own domain manual. ARS will ingest, build the graph, and scope your problem.",
    sample: "Upload your domain manual (PDF, RDF, or markdown) — we'll generate a graph schema in <24h.",
    icon: "📂",
  },
] as const;

type Domain = (typeof BRANCHES)[number]["k"];

type QueryState = "idle" | "loading" | "streaming" | "done" | "error";

interface ARSMessage {
  type: "start" | "result" | "done";
  domain?: string;
  node_id?: string;
  title?: string;
  hypothesis?: string;
  confidence?: number;
  evidence_count?: number;
  sources?: string[];
}

export default function GatewayClient() {
  const [domain, setDomain] = useState<Domain>("bioenergy");
  const [query, setQuery] = useState("");
  const [queryState, setQueryState] = useState<QueryState>("idle");
  const [results, setResults] = useState<Omit<ARSResultCardProps, "index">[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const selectedBranch = BRANCHES.find((b) => b.k === domain)!;

  function handleBranchClick(k: Domain) {
    setDomain(k);
    setQuery("");
    setResults([]);
    setQueryState("idle");
    setStatusMsg("");
  }

  function handleSampleClick() {
    setQuery(selectedBranch.sample);
  }

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setQueryState("loading");
    setResults([]);
    setStatusMsg("Connecting to PRISM-9…");

    try {
      // TODO: wire to live ARS Gateway at http://127.0.0.1:5000/v1/query on Jewel
      const res = await fetch("/api/ars/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain, query: q }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        setQueryState("error");
        setStatusMsg("ARS Gateway error — please try again.");
        return;
      }

      setQueryState("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let resultCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const msg = JSON.parse(raw) as ARSMessage;

            if (msg.type === "start") {
              setStatusMsg(`Running PRISM-9 on domain: ${msg.domain ?? domain}…`);
            } else if (msg.type === "result" && msg.node_id && msg.title && msg.hypothesis != null) {
              resultCount++;
              setStatusMsg(`Received ${resultCount} hypothesis${resultCount > 1 ? "es" : ""}…`);
              setResults((prev) => [
                ...prev,
                {
                  node_id: msg.node_id!,
                  title: msg.title!,
                  hypothesis: msg.hypothesis!,
                  confidence: msg.confidence ?? 0,
                  evidence_count: msg.evidence_count ?? 0,
                  sources: msg.sources ?? [],
                },
              ]);
            } else if (msg.type === "done") {
              setQueryState("done");
              setStatusMsg(
                resultCount > 0
                  ? `${resultCount} hypothesis${resultCount > 1 ? "es" : ""} generated. Click "Explain this" on any card for a plain-language summary.`
                  : "Query complete — no results."
              );
            }
          } catch {
            // malformed SSE frame — skip
          }
        }
      }

      setQueryState("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setQueryState("error");
      setStatusMsg("Connection error — ARS Gateway may be unavailable.");
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setQueryState("idle");
    setResults([]);
    setQuery("");
    setStatusMsg("");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">ARS Gateway</h1>
        <p className="text-slate-600 mt-2 text-base">
          Select a research domain and run a natural-language query against the PRISM-9 knowledge graph.
        </p>
      </div>

      {/* Domain selector */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Research Domain
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {BRANCHES.map((b) => (
            <button
              key={b.k}
              onClick={() => handleBranchClick(b.k)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-sm font-medium transition-all
                ${domain === b.k
                  ? "border-brand-500 bg-brand-50 text-brand-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                }`}
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-xs leading-tight text-center">{b.t}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{selectedBranch.d}</p>
      </div>

      {/* Query form */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Research Question
        </h2>
        <form onSubmit={handleRun} className="space-y-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={queryState === "loading" || queryState === "streaming"}
            rows={3}
            placeholder={selectedBranch.sample}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 disabled:bg-slate-50 disabled:text-slate-400 resize-y"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!query.trim() || queryState === "loading" || queryState === "streaming"}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-200 text-white disabled:text-brand-400 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
            >
              {(queryState === "loading" || queryState === "streaming") ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Running PRISM-9…
                </>
              ) : "Run PRISM-9"}
            </button>
            <button
              type="button"
              onClick={handleSampleClick}
              disabled={queryState === "loading" || queryState === "streaming"}
              className="text-sm text-brand-700 hover:text-brand-900 hover:underline disabled:opacity-40"
            >
              Use sample query →
            </button>
            {(queryState === "done" || queryState === "error") && (
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
              >
                ↩ Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Status bar */}
      {statusMsg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border ${
          queryState === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : queryState === "done"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          {queryState === "loading" || queryState === "streaming" ? (
            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : queryState === "done" ? (
            <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Hypotheses — {results.length} found
          </h2>
          <div className="space-y-4">
            {results.map((r, i) => (
              <ARSResultCard key={r.node_id} {...r} index={i} />
            ))}
          </div>

          {queryState !== "done" && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              More results incoming…
            </div>
          )}
        </div>
      )}

      {/* Empty state after done with no results */}
      {queryState === "done" && results.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">No hypotheses returned for that query and domain.</p>
        </div>
      )}
    </div>
  );
}
