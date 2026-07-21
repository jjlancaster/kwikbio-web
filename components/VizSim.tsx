"use client";

interface GraphNode {
  id: string;
  label: string;
  type: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relation?: string;
  weight?: number;
}

const NODE_COLORS: Record<string, string> = {
  protein:   "#00d4c8",
  gene:      "#f5c842",
  pathway:   "#7c3aed",
  compound:  "#22c55e",
  phenotype: "#f97316",
  concept:   "#94a3b8",
};

export default function VizSim({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  if (!nodes.length) return <p className="text-sm text-slate-500">No graph data</p>;

  const W = 560, H = 340, CX = W / 2, CY = H / 2;
  const R = Math.min(CX, CY) - 52;

  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    positions[n.id] = { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden bg-bio-navy/30">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 340 }}>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
          </marker>
          <marker id="arr-inh" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const s = positions[e.source], t = positions[e.target];
          if (!s || !t) return null;
          const inh = /inhibit|suppress|block|inactivat/i.test(e.relation ?? "");
          return (
            <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke={inh ? "#ef4444" : "#64748b"} strokeWidth={1.5} strokeOpacity={0.7}
              markerEnd={inh ? "url(#arr-inh)" : "url(#arr)"} />
          );
        })}

        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const fill = NODE_COLORS[n.type] ?? "#94a3b8";
          const short = n.label.length > 10 ? n.label.slice(0, 9) + "…" : n.label;
          return (
            <g key={n.id} transform={`translate(${pos.x},${pos.y})`}>
              <circle r={18} fill={fill} fillOpacity={0.18} stroke={fill} strokeWidth={2} />
              <text textAnchor="middle" dy="0.35em" fontSize={8} fill="#e2e8f0"
                style={{ userSelect: "none" }}>
                {short}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="px-3 py-2 border-t border-slate-700 flex flex-wrap gap-3">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
            <span className="text-xs text-slate-400">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
