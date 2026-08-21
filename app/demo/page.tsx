"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PreGate from "@/components/PreGate";
import BlurLayer from "@/components/BlurLayer";
import ARSResultCard, { ARSResultCardProps } from "@/components/ARSResultCard";
import Nav from "@/components/Nav";

const SHOWCASE_QUERY =
  "What is the causal link between APOE4 and late-onset Alzheimer's disease?";

type QueryState = "idle" | "loading" | "done" | "error";

interface MockResult extends Omit<ARSResultCardProps, "index"> {
  tier: "visible" | "blurred";
}

// Pre-seeded demo results (real structure, mock data until ARS wired)
const DEMO_RESULTS: MockResult[] = [
  {
    node_id: "D1",
    title: "D1 — Parameters",
    hypothesis: "APOE4 allele carriers show 3-4× increased late-onset Alzheimer's risk via disrupted lipid transport in neurons.",
    confidence: 0.91,
    evidence_count: 847,
    sources: ["Nature Genetics 2022", "Cell 2023", "NEJM 2021"],
    tier: "visible",
  },
  {
    node_id: "D2",
    title: "D2 — Correlations",
    hypothesis: "APOE4 correlates with accelerated amyloid-β clearance failure and tau hyperphosphorylation across 14 longitudinal cohorts.",
    confidence: 0.85,
    evidence_count: 412,
    sources: ["Alzheimer's & Dementia 2022", "JAMA Neurology 2023"],
    tier: "visible",
  },
  {
    node_id: "D3",
    title: "D3 — Causal Chains",
    hypothesis: "Cholesterol transport failure via APOE4 → synaptic vesicle dysfunction → tau spreading → hippocampal atrophy.",
    confidence: 0.78,
    evidence_count: 203,
    sources: ["Science 2022", "eLife 2023"],
    tier: "visible",
  },
  {
    node_id: "D4",
    title: "D4 — Temporal Evolution",
    hypothesis: "[FS!7 QUBO-ranked] Citation momentum rising +2.1× — 3 breakthrough papers in Q1 2024 reinforce causal chain.",
    confidence: 0.82,
    evidence_count: 156,
    sources: ["Nature 2024", "Cell Reports 2024"],
    tier: "blurred",
  },
  {
    node_id: "TOP",
    title: "#1 Ranked Hypothesis",
    hypothesis: "[FS!7 QUBO-optimal] TREM2-mediated microglial APOE4 clearance failure is the upstream causal node — earlier than amyloid aggregation.",
    confidence: 0.94,
    evidence_count: 521,
    sources: ["Science 2024", "Nature Medicine 2023", "Cell 2024"],
    tier: "blurred",
  },
];

function DemoPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(SHOWCASE_QUERY);
  const [queryState, setQueryState] = useState<QueryState>("idle");
  const [results, setResults] = useState<MockResult[]>([]);
  const [queryCount, setQueryCount] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const queryRef = useRef(query);
  queryRef.current = query;

  // Check if returning authenticated from OAuth redirect
  useEffect(() => {
    if (searchParams.get("unlocked") === "1") {
      setAuthenticated(true);
    }
  }, [searchParams]);

  async function runQuery() {
    if (queryState === "loading") return;
    setQueryState("loading");
    setResults([]);
    setShowGate(false);

    // Simulate ARS processing (replace with real SSE stream when wired)
    await new Promise((r) => setTimeout(r, 1200));
    setResults(DEMO_RESULTS);
    setQueryCount((c) => c + 1);
    setQueryState("done");

    if (!authenticated) {
      // Small delay so user sees results render before gate fires
      setTimeout(() => setShowGate(true), 400);
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).analytics) {
        ((window as unknown as Record<string, unknown>).analytics as { track: (e: string, p: object) => void })
          .track("demo_result_render", { query: queryRef.current });
      }
    }
  }

  function handleAuthSuccess() {
    setAuthenticated(true);
    setShowGate(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            kwiKBio · ARS Demo · FastScience! v7
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Run a real ARS query
          </h1>
          <p className="text-gray-500 text-sm">
            The Automated Research System (US Patent 11,282,088) searches the biomedical
            knowledge graph in real-time. D1–D3 are free. Sign in to unlock D4, D5, and the
            top-ranked hypothesis.
          </p>
        </div>

        {/* Query input */}
        <div className="mb-6 flex flex-col gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter a biomedical hypothesis or question…"
          />
          <button
            onClick={runQuery}
            disabled={queryState === "loading" || !query.trim()}
            className="self-start bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {queryState === "loading" ? "Analyzing…" : "Run Query →"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Visible layers */}
            {results
              .filter((r) => r.tier === "visible" || authenticated)
              .map((r, i) => (
                <ARSResultCard key={r.node_id} {...r} index={i} />
              ))}

            {/* Blurred layers + gate */}
            {!authenticated && (
              <div className="relative">
                {/* Blurred D4 / Top result */}
                <div className="flex flex-col gap-4">
                  {results
                    .filter((r) => r.tier === "blurred")
                    .map((r, i) => (
                      <BlurLayer key={r.node_id} blurred={showGate}>
                        <ARSResultCard {...r} index={results.filter((x) => x.tier === "visible").length + i} />
                      </BlurLayer>
                    ))}
                </div>

                {/* Gate overlay */}
                <PreGate
                  queryText={query}
                  queryCount={queryCount}
                  onAuthSuccess={handleAuthSuccess}
                  visible={showGate}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {queryState === "idle" && results.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Hit <strong>Run Query</strong> to see ARS in action.
          </div>
        )}
      </main>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-400">Loading…</div>}>
      <DemoPageInner />
    </Suspense>
  );
}
