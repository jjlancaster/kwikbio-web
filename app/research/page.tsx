"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import IngestPanel from "@/components/IngestPanel";
import SlamPanel from "@/components/SlamPanel";
import HypothesisPanel from "@/components/HypothesisPanel";
import LOPEPanel from "@/components/LOPEPanel";
import ExperimentChooser from "@/components/ExperimentChooser";
import DAEPanel from "@/components/DAEPanel";

type Stage = "ingest" | "slam" | "hypotheses" | "lope" | "expdir" | "dae";

const STAGES: { id: Stage; label: string; desc: string }[] = [
  { id: "ingest",     label: "1. Ingest",       desc: "Extract triples" },
  { id: "slam",       label: "2. SLAM",          desc: "Causal graph + ODE" },
  { id: "hypotheses", label: "3. Hypotheses",    desc: "VOI ranking" },
  { id: "lope",       label: "4. LOPE",          desc: "Browse experiments" },
  { id: "expdir",     label: "5. ExpDir",        desc: "Auto-select CRO" },
  { id: "dae",        label: "6. DAE",           desc: "Analyze results" },
];

export default function ResearchPage() {
  const [stage, setStage] = useState<Stage>("ingest");
  const [query, setQuery] = useState("");
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("");
  const [selectedExperimentId, setSelectedExperimentId] = useState("");

  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="min-h-screen bg-bio-navy text-slate-200">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bio-gold mb-1">Research Pipeline</h1>
          <p className="text-slate-400 text-sm">ARS-FS!4 closed loop — Ingest → SLAM → VOI → LOPE → CRO → DAE</p>
        </div>

        <div className="mb-6 flex gap-3">
          <input
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-bio-navy/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bio-teal text-sm"
            placeholder="Research query (e.g. BRCA1 in triple-negative breast cancer)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto gap-0 mb-6 border-b border-slate-700/50">
          {STAGES.map((s) => (
            <button key={s.id} onClick={() => setStage(s.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-colors ${
                stage === s.id
                  ? "text-bio-teal border-b-2 border-bio-teal bg-bio-teal/5"
                  : "text-slate-400 hover:text-slate-200"
              }`}>
              <span className="block">{s.label}</span>
              <span className="block text-slate-500 font-normal">{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-bio-navy/40 p-6 min-h-64">
          {stage === "ingest"     && <IngestPanel />}
          {stage === "slam"       && <SlamPanel query={query} />}
          {stage === "hypotheses" && (
            <HypothesisPanel onSelect={(h) => {
              setSelectedHypothesisId(h.id);
              setStage("lope");
            }} />
          )}
          {stage === "lope" && (
            <LOPEPanel
              hypothesisId={selectedHypothesisId}
              onSubmit={(expId) => {
                setSelectedExperimentId(expId);
                setStage("expdir");
              }}
            />
          )}
          {stage === "expdir" && (
            <ExperimentChooser
              experimentId={selectedExperimentId}
              hypothesisId={selectedHypothesisId}
            />
          )}
          {stage === "dae" && <DAEPanel />}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => stageIndex > 0 && setStage(STAGES[stageIndex - 1].id)}
            disabled={stageIndex === 0}
            className="text-sm px-4 py-2 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-30">
            ← Previous
          </button>
          <button
            onClick={() => stageIndex < STAGES.length - 1 && setStage(STAGES[stageIndex + 1].id)}
            disabled={stageIndex === STAGES.length - 1}
            className="text-sm px-4 py-2 bg-bio-teal text-bio-navy font-semibold rounded-md hover:opacity-90 disabled:opacity-30">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
