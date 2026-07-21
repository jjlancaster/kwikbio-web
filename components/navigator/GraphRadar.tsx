"use client";

import type { QMObject, QueryManagerResponse } from "@/lib/ars-query";

const ROLE_TONE: Record<QMObject["role"], string> = {
  goal: "#f5c842", // bio-gold
  subsystem: "#00d4c8", // bio-teal
  peer: "#8b7bd8", // muted purple
};

interface Pt {
  x: number;
  y: number;
}

// Knowledge Graph Radar — conceptual neighborhood. Ring distance encodes
// OntologyLayer (the "hop" depth), which the Level bound already governs.
export default function GraphRadar({ result }: { result: QueryManagerResponse | null }) {
  const size = 360;
  const c = size / 2;
  const objects = result?.objects ?? [];
  const edges = result?.edges ?? [];

  // Layout: subject at centre; objects on rings by layer, spread by index.
  const pos = new Map<string, Pt>();
  if (result) pos.set(result.subject, { x: c, y: c });
  objects.forEach((o, i) => {
    const angle = (i / Math.max(objects.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 46 + Math.min(o.layer, 5) * 26;
    pos.set(o.label, { x: c + radius * Math.cos(angle), y: c + radius * Math.sin(angle) });
  });

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Knowledge Graph Radar</h2>
        <span className="text-xs text-slate-500">Conceptual Neighborhood</span>
      </div>

      {objects.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No neighborhood yet.</div>
      ) : (
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[360px]" role="img" aria-label="knowledge graph radar">
          {/* concentric hop rings */}
          {[1, 2, 3].map((ring) => (
            <circle key={ring} cx={c} cy={c} r={46 + ring * 26 - 13} fill="none" stroke="rgba(255,255,255,0.06)" />
          ))}

          {/* edges */}
          {edges.map((e, i) => {
            const a = pos.get(e.source);
            const b = pos.get(e.target);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.edgeKind === "causal" ? "rgba(0,212,200,0.5)" : "rgba(255,255,255,0.18)"}
                strokeDasharray={e.edgeKind === "causal" ? undefined : "3 3"}
              />
            );
          })}

          {/* centre = subject */}
          {result && (
            <g>
              <circle cx={c} cy={c} r={16} fill="#4a1d8e" stroke="#f5c842" strokeWidth={1.5} />
              <text x={c} y={c + 30} textAnchor="middle" className="fill-white" style={{ fontSize: 9 }}>
                {result.subject.length > 18 ? result.subject.slice(0, 17) + "…" : result.subject}
              </text>
            </g>
          )}

          {/* object nodes */}
          {objects.map((o) => {
            const p = pos.get(o.label);
            if (!p) return null;
            const r = 5 + o.confidence * 6;
            return (
              <g key={o.label}>
                <circle cx={p.x} cy={p.y} r={r} fill={ROLE_TONE[o.role]} opacity={0.85} />
                <text x={p.x} y={p.y - r - 3} textAnchor="middle" className="fill-slate-300" style={{ fontSize: 8 }}>
                  {o.label.length > 16 ? o.label.slice(0, 15) + "…" : o.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.goal }} />goal</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.subsystem }} />subsystem</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ROLE_TONE.peer }} />peer</span>
      </div>
    </section>
  );
}
