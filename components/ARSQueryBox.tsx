"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useArsQuery, hasResultData, type ArsEvent } from "@/lib/useArsQuery";

const SUGGESTIONS = ["Drug resistance", "Carbon capture", "CRISPR"];

export default function ARSQueryBox() {
  const [question, setQuestion] = useState("");
  const { run, busy, statusMsg, result, limit } = useArsQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(question);
  }

  return (
    <div className="mt-10 max-w-2xl mx-auto text-left">
      <form onSubmit={onSubmit}>
        <div className="flex items-stretch gap-2 rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100 transition">
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={busy}
            placeholder="Ask your research question…"
            aria-label="Ask your research question"
            className="flex-1 bg-transparent px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !question.trim()}
            aria-label="Run ARS query"
            className="m-1.5 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "…" : "→"}
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => {
              setQuestion(s);
              run(s);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        → No signup required for your first query
      </p>

      {busy && (
        <div
          className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4"
          aria-live="polite"
        >
          <div className="text-sm font-medium text-brand-800">{statusMsg}</div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-600" />
          </div>
        </div>
      )}

      {limit && !busy && (
        <div
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5"
          aria-live="polite"
        >
          <div className="font-semibold text-amber-900">{limit}</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-600 hover:text-brand-700"
            >
              Log in
            </Link>
          </div>
        </div>
      )}

      {result && !busy && <ResultPanel evt={result} />}
    </div>
  );
}

function ResultPanel({ evt }: { evt: ArsEvent }) {
  const entities = evt.prism9?.entities ?? [];
  const ranked = evt.hypotheses?.ranked ?? [];
  const suggestions = evt.experiments?.suggestions ?? [];

  if (!hasResultData(evt)) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          PRISM-9 reduction
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {evt.message ??
            "The Gateway returned no entities for this query. Try rephrasing, or create an account to run a full reduction."}
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Create free account
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {entities.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            PRISM-9 · dominant entities
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {entities.slice(0, 9).map((en, i) => (
              <span
                key={`${en}-${i}`}
                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm text-brand-800"
              >
                {en}
              </span>
            ))}
          </div>
        </div>
      )}
      {ranked.length > 0 && (
        <div className="text-sm text-slate-700">
          <span className="font-semibold">{ranked.length}</span> ranked
          hypotheses returned.
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="text-sm text-slate-700">
          <span className="font-semibold">{suggestions.length}</span> experiment
          suggestions matched.
        </div>
      )}
      <Link
        href="/signup"
        className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Save this to your knowledge graph →
      </Link>
    </div>
  );
}
