"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface P9Node {
  id: string;
  label: string;
  definition: string;
  role?: string;
  confidence?: number;
}

interface P9Edge {
  from: string;
  to: string;
  relation: string;
}

interface P9Layer {
  title: string;
  summary: string;
  nodes: P9Node[];
  edges: P9Edge[];
}

interface P9Data {
  subject: string;
  prism9: {
    normal: P9Layer;
    dysfunction: P9Layer;
    fix: P9Layer;
    cope: P9Layer;
  };
}

// ─── Layer config ─────────────────────────────────────────────────────────────
const LAYERS = [
  {
    key: "normal" as const,
    icon: "◎",
    label: "Normal",
    accent: "border-emerald-500",
    headerBg: "bg-emerald-500/10",
    headerText: "text-emerald-400",
    dotBg: "bg-emerald-400",
    nodeBorder: "border-emerald-500/30",
    nodeBg: "bg-emerald-500/5",
    badge: "bg-emerald-500/20 text-emerald-300",
    edgeColor: "text-emerald-400/70",
    subtitle: "Healthy physiology",
  },
  {
    key: "dysfunction" as const,
    icon: "⚡",
    label: "Dysfunction",
    accent: "border-rose-500",
    headerBg: "bg-rose-500/10",
    headerText: "text-rose-400",
    dotBg: "bg-rose-400",
    nodeBorder: "border-rose-500/30",
    nodeBg: "bg-rose-500/5",
    badge: "bg-rose-500/20 text-rose-300",
    edgeColor: "text-rose-400/70",
    subtitle: "Disease mechanics",
  },
  {
    key: "fix" as const,
    icon: "✦",
    label: "Fix",
    accent: "border-sky-500",
    headerBg: "bg-sky-500/10",
    headerText: "text-sky-400",
    dotBg: "bg-sky-400",
    nodeBorder: "border-sky-500/30",
    nodeBg: "bg-sky-500/5",
    badge: "bg-sky-500/20 text-sky-300",
    edgeColor: "text-sky-400/70",
    subtitle: "Therapy pathways",
  },
  {
    key: "cope" as const,
    icon: "❋",
    label: "Cope",
    accent: "border-amber-500",
    headerBg: "bg-amber-500/10",
    headerText: "text-amber-400",
    dotBg: "bg-amber-400",
    nodeBorder: "border-amber-500/30",
    nodeBg: "bg-amber-500/5",
    badge: "bg-amber-500/20 text-amber-300",
    edgeColor: "text-amber-400/70",
    subtitle: "Living with it",
  },
] as const;

const EXAMPLES = [
  "Parkinson's Disease",
  "BRCA1 mutation",
  "Blood pressure regulation",
  "Alzheimer's Disease",
  "Type 2 Diabetes",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NodeCard({
  node,
  cfg,
}: {
  node: P9Node;
  cfg: (typeof LAYERS)[number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${cfg.nodeBorder} ${cfg.nodeBg} hover:border-white/20`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-2 text-sm font-medium text-white`}>
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dotBg}`} />
          {node.label}
        </span>
        {node.confidence !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.badge}`}>
            {Math.round(node.confidence * 100)}%
          </span>
        )}
        {node.role && (
          <span className={`hidden sm:inline text-xs px-1.5 py-0.5 rounded ${cfg.badge}`}>
            {node.role}
          </span>
        )}
        <span className="text-slate-500 text-xs flex-shrink-0">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed pl-4">
          {node.definition}
        </p>
      )}
    </button>
  );
}

function EdgeList({
  edges,
  nodes,
  cfg,
}: {
  edges: P9Edge[];
  nodes: P9Node[];
  cfg: (typeof LAYERS)[number];
}) {
  if (!edges.length) return null;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n.label]));
  return (
    <div className="mt-3 space-y-1 border-t border-white/5 pt-3">
      <div className="text-xs uppercase tracking-wider text-slate-600 mb-2">Connections</div>
      {edges.map((e, i) => (
        <div key={i} className={`text-xs flex items-center gap-1.5 ${cfg.edgeColor}`}>
          <span className="text-slate-300 font-medium">{byId[e.from] ?? e.from}</span>
          <span className="text-slate-600">→</span>
          <span className="italic text-slate-500">{e.relation}</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-300 font-medium">{byId[e.to] ?? e.to}</span>
        </div>
      ))}
    </div>
  );
}

function LayerPanel({
  layerCfg,
  data,
}: {
  layerCfg: (typeof LAYERS)[number];
  data: P9Layer;
}) {
  return (
    <div className={`rounded-xl border ${layerCfg.accent} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 ${layerCfg.headerBg} border-b border-white/5`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-base ${layerCfg.headerText}`}>{layerCfg.icon}</span>
          <span className={`text-sm font-bold tracking-wide uppercase ${layerCfg.headerText}`}>
            {layerCfg.label}
          </span>
          <span className="text-slate-600 text-xs">— {layerCfg.subtitle}</span>
        </div>
        <h3 className="text-white font-medium text-sm leading-snug">{data.title}</h3>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-3 bg-white/2">
        <p className="text-xs text-slate-400 leading-relaxed">{data.summary}</p>

        {/* Nodes */}
        <div className="space-y-1.5">
          {(data.nodes ?? []).map((node) => (
            <NodeCard key={node.id} node={node} cfg={layerCfg} />
          ))}
        </div>

        {/* Edges */}
        <EdgeList edges={data.edges ?? []} nodes={data.nodes ?? []} cfg={layerCfg} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Prism9Entry() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<P9Data | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(kw?: string) {
    const query = (kw ?? keyword).trim();
    if (!query) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/prism9/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data as P9Data);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to build Prism9");
      setStatus("error");
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  function tryExample(ex: string) {
    setKeyword(ex);
    submit(ex);
  }

  return (
    <div className="min-h-screen bg-bio-navy text-slate-200">
      {/* ── Hero + input ─────────────────────────────────────────────── */}
      <div
        className={`transition-all duration-500 ${
          status === "done" ? "py-6 border-b border-white/10 bg-black/20" : "py-24"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-4">
            <span className="text-bio-gold font-bold">FS!7</span>
            <span className="text-bio-teal">Prism9 Live</span>
          </div>

          {status !== "done" && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                What do you want<br className="hidden md:block" /> to understand?
              </h1>
              <p className="text-slate-400 mb-10 text-lg max-w-xl mx-auto">
                Enter any biological system, disease, gene, or concept — Prism9 builds
                a live causal graph across four dimensions.
              </p>
            </>
          )}

          {/* Input row */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. Parkinson's Disease, JAK2 pathway, blood pressure..."
              className="flex-1 rounded-xl border border-white/15 bg-white/8 px-5 py-3.5 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-base"
              disabled={status === "loading"}
            />
            <button
              onClick={() => submit()}
              disabled={status === "loading" || !keyword.trim()}
              className="rounded-xl bg-bio-teal px-6 py-3.5 font-semibold text-bio-navy hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm whitespace-nowrap"
            >
              {status === "loading" ? "Building…" : "Explore →"}
            </button>
          </div>

          {/* Examples */}
          {status !== "done" && status !== "loading" && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-slate-600 self-center">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => tryExample(ex)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:border-bio-teal hover:text-bio-teal transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {status === "loading" && (
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="inline-block h-12 w-12 rounded-full border-2 border-bio-teal border-t-transparent animate-spin mb-6" />
          <p className="text-slate-400 text-lg">Building your Prism9 graph for</p>
          <p className="text-bio-gold font-semibold text-xl mt-1">"{keyword}"</p>
          <p className="text-slate-600 text-sm mt-4">Mapping Normal · Dysfunction · Fix · Cope…</p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {status === "error" && (
        <div className="max-w-xl mx-auto px-6 py-12 text-center">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-6">
            <p className="text-red-300 font-semibold mb-1">Graph build failed</p>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
            <button
              onClick={() => { setStatus("idle"); setErrorMsg(""); }}
              className="mt-4 text-xs text-bio-teal hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Prism9 Four-Panel Display ─────────────────────────────────── */}
      {status === "done" && result && (
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          {/* Subject header */}
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-white">{result.subject}</h2>
            <span className="text-sm text-slate-500">Prism9 causal graph</span>
            <button
              onClick={() => { setStatus("idle"); setResult(null); }}
              className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition"
            >
              ← New search
            </button>
          </div>

          {/* 4-panel grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {LAYERS.map((cfg) => {
              const layerData = result.prism9[cfg.key];
              if (!layerData) return null;
              return (
                <LayerPanel key={cfg.key} layerCfg={cfg} data={layerData} />
              );
            })}
          </div>

          {/* Footer context */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/5 pt-4 text-xs text-slate-600">
            <span>
              <span className="text-slate-400">FastScience!</span> Prism9 — Navigate · Discover · Heal
            </span>
            <span>source: live LLM synthesis</span>
            <span>
              <a href="/navigator" className="text-bio-teal hover:underline">
                Open ARS Navigator →
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
