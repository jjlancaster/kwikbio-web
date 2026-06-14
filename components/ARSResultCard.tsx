"use client";

import { useState, useRef } from "react";

export interface ARSResultCardProps {
  node_id: string;
  title: string;
  hypothesis: string;
  confidence: number;
  evidence_count: number;
  sources: string[];
  index: number;
}

function confidenceLabel(c: number) {
  if (c >= 0.85) return { label: "High", color: "bg-emerald-100 text-emerald-800" };
  if (c >= 0.70) return { label: "Moderate", color: "bg-amber-100 text-amber-800" };
  if (c > 0) return { label: "Preliminary", color: "bg-orange-100 text-orange-800" };
  return { label: "Pending", color: "bg-slate-100 text-slate-500" };
}

export default function ARSResultCard({
  node_id,
  title,
  hypothesis,
  confidence,
  evidence_count,
  sources,
  index,
}: ARSResultCardProps) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainState, setExplainState] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [explainText, setExplainText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const conf = confidenceLabel(confidence);

  async function handleExplain() {
    // Toggle off if already open and done
    if (explainOpen && explainState === "done") {
      setExplainOpen(false);
      setExplainState("idle");
      setExplainText("");
      return;
    }

    setExplainOpen(true);

    // Don't re-fetch if we already have text
    if (explainState === "done" || explainState === "streaming" || explainState === "loading") return;

    setExplainState("loading");
    setExplainText("");

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      // TODO: wire to live ARS SSE stream at /v1/query?mode=explain on Jewel
      const res = await fetch("/api/ars/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ node_id, context: hypothesis }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        setExplainState("error");
        return;
      }

      setExplainState("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

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
            const msg = JSON.parse(raw) as { type: string; text?: string };
            if (msg.type === "token" && msg.text) {
              setExplainText((prev) => prev + (prev ? " " : "") + msg.text);
            } else if (msg.type === "done") {
              setExplainState("done");
            }
          } catch {
            // malformed SSE frame — skip
          }
        }
      }

      setExplainState("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setExplainState("error");
      }
    }
  }

  const buttonLabel =
    explainOpen && explainState === "done" ? "Hide explanation" : "Explain this";

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <h3 className="font-semibold text-slate-900 leading-snug text-sm md:text-base truncate">{title}</h3>
          </div>
          {confidence > 0 && (
            <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${conf.color}`}>
              {conf.label} {Math.round(confidence * 100)}%
            </span>
          )}
        </div>

        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{hypothesis}</p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {evidence_count > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {evidence_count} evidence nodes
            </span>
          )}
          {sources.map((s) => (
            <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">{s}</span>
          ))}
        </div>
      </div>

      {/* Explain This button */}
      <div className="px-5 pb-4">
        <button
          onClick={handleExplain}
          disabled={explainState === "loading" || explainState === "streaming"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-900 border border-brand-200 hover:border-brand-400 bg-brand-50 hover:bg-brand-100 rounded px-3 py-1.5 transition disabled:opacity-50 disabled:cursor-wait"
        >
          {explainState === "loading" || explainState === "streaming" ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <span>💬</span>
              {buttonLabel}
            </>
          )}
        </button>
      </div>

      {/* Plain-language explanation panel */}
      {explainOpen && (explainState !== "idle") && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              💬 Plain Language
            </span>
            <span className="text-xs text-slate-400 font-mono">node: {node_id}</span>
          </div>

          {explainState === "error" ? (
            <p className="text-sm text-red-600">Failed to load explanation — please try again.</p>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">
              {explainText}
              {(explainState === "streaming" || explainState === "loading") && (
                <span className="inline-block w-1.5 h-4 bg-brand-400 rounded-sm ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
