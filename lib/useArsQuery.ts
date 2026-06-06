"use client";

import { useEffect, useRef, useState } from "react";

export type ArsEvent = {
  status: "running" | "complete" | "error" | "limit";
  stage?: string;
  message?: string;
  fallback?: boolean;
  prism9?: { entities?: string[]; relations?: Record<string, unknown> };
  hypotheses?: { ranked?: unknown[] };
  experiments?: { suggestions?: unknown[] };
};

const FALLBACK: ArsEvent = {
  status: "complete",
  fallback: true,
  message:
    "The live ARS engine is warming up. Your question is valid — create a free account and we'll run the full PRISM-9 reduction as soon as the Gateway is online.",
};

/**
 * Shared ARS query runner. Owns the POST /api/ars-query call and the SSE
 * stream parsing so both the public hero box and the authenticated Gateway
 * workspace render identical engine behavior with different chrome.
 *
 * Hardened: tolerates CRLF SSE delimiters, flushes a trailing block, and
 * forces an honest graceful fallback whenever the stream ends without a
 * terminal event. Raw errors are never surfaced.
 *
 * Unmount-safe: each run carries a monotonic id and an AbortController. On
 * unmount (or when a newer run starts) the in-flight fetch/reader is aborted
 * and no stale state writes land — guarded by `alive(runId)`.
 */
export function useArsQuery() {
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<ArsEvent | null>(null);
  const [limit, setLimit] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Only the latest run, while still mounted, may write state.
  const alive = (runId: number) =>
    mountedRef.current && runId === runIdRef.current;

  function reset() {
    setResult(null);
    setLimit(null);
    setStatusMsg("");
  }

  async function run(raw: string) {
    const q = raw.trim();
    if (!q || busy) return;

    // Supersede any prior in-flight run.
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const runId = ++runIdRef.current;

    setBusy(true);
    setResult(null);
    setLimit(null);
    setStatusMsg("Running PRISM-9 reduction… (10–30 seconds)");

    const gracefulFallback = () => {
      if (alive(runId)) setResult(FALLBACK);
    };

    try {
      const res = await fetch("/api/ars-query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: ac.signal,
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        if (alive(runId)) {
          setLimit(
            data?.message ??
              "You've used your free query. Create a free account to keep exploring.",
          );
        }
        return;
      }

      if (!res.body) {
        gracefulFallback();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let gotTerminal = false;

      const handleBlock = (block: string) => {
        const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) return;
        try {
          const evt: ArsEvent = JSON.parse(dataLine.slice(5).trim());
          if (evt.status === "running") {
            if (alive(runId)) setStatusMsg(evt.message ?? "Working…");
          } else if (evt.status === "limit") {
            if (alive(runId)) setLimit(evt.message ?? null);
            gotTerminal = true;
          } else {
            if (alive(runId)) setResult(evt);
            gotTerminal = true;
          }
        } catch {
          /* ignore malformed SSE block */
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        // Normalize CRLF so "\n\n" and "\r\n\r\n" delimiters both split cleanly.
        buf = (buf + decoder.decode(value, { stream: true })).replace(
          /\r\n/g,
          "\n",
        );
        const blocks = buf.split("\n\n");
        buf = blocks.pop() ?? "";
        for (const block of blocks) handleBlock(block);
      }
      if (buf.trim()) handleBlock(buf);
      if (!gotTerminal) gracefulFallback();
    } catch {
      // Intentional aborts (unmount / superseded run) must not fall back.
      if (ac.signal.aborted) return;
      // Never surface a raw error — degrade gracefully and honestly.
      gracefulFallback();
    } finally {
      if (alive(runId)) {
        setBusy(false);
        setStatusMsg("");
      }
    }
  }

  return { run, reset, busy, statusMsg, result, limit };
}

export function hasResultData(evt: ArsEvent | null): boolean {
  if (!evt) return false;
  return (
    (evt.prism9?.entities?.length ?? 0) > 0 ||
    (evt.hypotheses?.ranked?.length ?? 0) > 0 ||
    (evt.experiments?.suggestions?.length ?? 0) > 0
  );
}
