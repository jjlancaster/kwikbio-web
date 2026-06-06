"use client";

import { useEffect, useRef, useState } from "react";
import { useArsQuery, hasResultData } from "@/lib/useArsQuery";

const PLACEHOLDER =
  'e.g. "What drives antibiotic resistance in P. aeruginosa biofilms?"';

export default function GatewayWorkspace() {
  const [question, setQuestion] = useState("");
  const { run, busy, statusMsg, result, limit } = useArsQuery();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(question);
  }

  const entities = result?.prism9?.entities ?? [];
  const ranked = result?.hypotheses?.ranked ?? [];
  const suggestions = result?.experiments?.suggestions ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={submit}>
        <div className="rounded-xl border border-shell-border bg-shell-surface p-3 focus-within:border-accent">
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
            disabled={busy}
            rows={3}
            placeholder={PLACEHOLDER}
            aria-label="ARS research query"
            className="w-full resize-none bg-transparent px-2 py-1 font-mono text-sm text-ink-primary placeholder:text-ink-secondary/50 outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-ink-secondary/60">
              ⌘/Ctrl + Enter to run
            </span>
            <button
              type="submit"
              disabled={busy || !question.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-shell-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Running…" : "Run query →"}
            </button>
          </div>
        </div>
      </form>

      {busy && (
        <div
          className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4"
          aria-live="polite"
        >
          <div className="text-sm font-medium text-accent">{statusMsg}</div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-accent/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
        </div>
      )}

      {limit && !busy && (
        <div className="mt-6 rounded-lg border border-vertical-energy/40 bg-vertical-energy/10 p-5">
          <div className="font-medium text-ink-primary">{limit}</div>
        </div>
      )}

      {result && !busy && (
        <div className="mt-6 space-y-5">
          {hasResultData(result) ? (
            <>
              {entities.length > 0 && (
                <Panel title={`${entities.length} controlling factors identified`}>
                  <ol className="space-y-1.5">
                    {entities.slice(0, 9).map((en, i) => (
                      <li
                        key={`${en}-${i}`}
                        className="flex items-baseline gap-3 text-sm text-ink-primary"
                      >
                        <span className="font-mono text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{en}</span>
                      </li>
                    ))}
                  </ol>
                </Panel>
              )}
              {ranked.length > 0 && (
                <Panel title="Ranked hypotheses">
                  <p className="text-sm text-ink-secondary">
                    <span className="font-semibold text-ink-primary">
                      {ranked.length}
                    </span>{" "}
                    hypotheses returned, ordered by causal coherence.
                  </p>
                </Panel>
              )}
              {suggestions.length > 0 && (
                <Panel title="CRO matching">
                  <p className="text-sm text-ink-secondary">
                    <span className="font-semibold text-ink-primary">
                      {suggestions.length}
                    </span>{" "}
                    experiment suggestions ready for CRO routing (6% pass-through).
                  </p>
                </Panel>
              )}
            </>
          ) : (
            <Panel title="PRISM-9 reduction">
              <p className="text-sm leading-relaxed text-ink-secondary">
                {result.message ??
                  "The Gateway returned no entities for this query. Try rephrasing — narrower, mechanism-level questions reduce best."}
              </p>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-shell-border bg-shell-surface p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
        {title}
      </div>
      {children}
    </section>
  );
}
