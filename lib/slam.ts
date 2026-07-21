import type { KTuple, CausalNode, CausalEdge, CausalGraph, PathwayModel, SlamResult, SimulationTrajectory } from './types';

const ARS_GATEWAY  = process.env.ARS_GATEWAY_URL  ?? 'http://localhost:5000';
const OLLAMA_URL   = process.env.OLLAMA_URL        ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL      ?? 'hermes3:8b';

// ── K-tuple extraction ────────────────────────────────────────────

function arsResponseToKTuples(ars: Record<string, unknown>): KTuple[] {
  const subject = (ars.subject as string) ?? '';
  const objects = (ars.objects as Array<{ label: string; role: string; confidence: number }>) ?? [];
  if (!subject || objects.length === 0) return [];
  return objects.map(o => ({
    subject,
    relation: o.role === 'subsystem' ? 'contains'
            : o.role === 'goal'      ? 'drives'
                                     : 'associates_with',
    object:     o.label,
    confidence: o.confidence ?? 0.5,
  }));
}

async function extractViaOllama(query: string, domain: string): Promise<KTuple[]> {
  const prompt =
    `Extract knowledge k-tuples from this research query as a JSON array.\n` +
    `Query: "${query}"\nDomain: ${domain}\n` +
    `Output ONLY a JSON array: [{"subject":"...","relation":"activates|inhibits|associates_with|causes|regulates|binds","object":"...","confidence":0.0-1.0}]`;
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { response: string };
    const m = data.response.match(/\[[\s\S]*\]/);
    if (!m) return [];
    return JSON.parse(m[0]) as KTuple[];
  } catch { return []; }
}

// ── Causal graph construction ─────────────────────────────────────

function inferNodeType(label: string): CausalNode['type'] {
  const l = label.toLowerCase();
  if (/jak|stat|pi3k|akt|mtor|ras|raf|mek|erk|nf-?kb|il-?\d|tnf|ifn/.test(l)) return 'protein';
  if (/gene|mrna|lncrna|mirna/.test(l)) return 'gene';
  if (/pathway|cascade|signaling|loop/.test(l)) return 'pathway';
  if (/compound|drug|inhibitor|metabolite|lipid|glucose|atp/.test(l)) return 'compound';
  if (/disease|disorder|cancer|syndrome|phenotype/.test(l)) return 'phenotype';
  return 'concept';
}

function buildCausalGraph(tuples: KTuple[]): CausalGraph {
  const nodeMap = new Map<string, CausalNode>();
  const edges: CausalEdge[] = [];

  for (const t of tuples) {
    if (!nodeMap.has(t.subject)) {
      nodeMap.set(t.subject, { id: t.subject, label: t.subject, type: inferNodeType(t.subject), confidence: 1.0 });
    }
    if (!nodeMap.has(t.object)) {
      nodeMap.set(t.object, { id: t.object, label: t.object, type: inferNodeType(t.object), confidence: t.confidence });
    }
    edges.push({ source: t.subject, target: t.object, relation: t.relation, weight: t.confidence, confidence: t.confidence });
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}

// ── Pathway model + forward ODE simulation ────────────────────────
// dx_i/dt = Σ_j w_ji·x_j  −  decay_i·x_i  +  input_i

function buildPathwayModel(g: CausalGraph): PathwayModel {
  const params: Record<string, number> = {};
  for (const n of g.nodes) {
    params[`decay_${n.id}`] = 0.1;
    params[`input_${n.id}`] = 0.0;
  }
  // Seed first node
  if (g.nodes.length > 0) params[`input_${g.nodes[0].id}`] = 1.0;
  return { nodes: g.nodes, edges: g.edges, params };
}

function runEuler(
  model: PathwayModel,
  steps = 100,
  dt = 0.05,
): { trajectory: SimulationTrajectory; steadyState: Record<string, number>; converged: boolean } {
  const ids = model.nodes.map(n => n.id);
  const state: Record<string, number> = {};
  const traj:  Record<string, number[]> = {};
  const timepoints: number[] = [0];

  for (const id of ids) {
    state[id] = model.params[`input_${id}`] ?? 0;
    traj[id]  = [state[id]];
  }

  // Incoming edges per node
  const incoming: Record<string, Array<{ src: string; w: number }>> = {};
  for (const id of ids) incoming[id] = [];
  for (const e of model.edges) {
    if (incoming[e.target]) {
      const inhibitory = /inhibit|suppress|block|inactivat/.test(e.relation);
      incoming[e.target].push({ src: e.source, w: inhibitory ? -e.weight : e.weight });
    }
  }

  let converged = false;
  for (let step = 1; step <= steps; step++) {
    timepoints.push(step * dt);
    const next: Record<string, number> = {};
    let maxDelta = 0;

    for (const id of ids) {
      const flux  = incoming[id].reduce((s, { src, w }) => s + w * state[src], 0);
      const decay = (model.params[`decay_${id}`] ?? 0.1) * state[id];
      const inp   = step === 1 ? (model.params[`input_${id}`] ?? 0) : 0;
      const dx    = flux - decay + inp;
      next[id]    = Math.max(0, state[id] + dt * dx);
      maxDelta    = Math.max(maxDelta, Math.abs(dx));
      traj[id].push(next[id]);
    }

    Object.assign(state, next);
    if (maxDelta < 0.001) { converged = true; break; }
  }

  return { trajectory: { timepoints, states: traj }, steadyState: { ...state }, converged };
}

// ── Public API ────────────────────────────────────────────────────

export async function runSLAM(query: string, domain = 'general'): Promise<SlamResult> {
  const sessionId = crypto.randomUUID();

  // 1. ARS Gateway
  let arsResponse: Record<string, unknown> = {};
  try {
    const r = await fetch(`${ARS_GATEWAY}/v1/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, source_session: sessionId, confidence_floor: 0.3 }),
      signal: AbortSignal.timeout(15_000),
    });
    if (r.ok) arsResponse = await r.json() as Record<string, unknown>;
  } catch { /* gateway unavailable */ }

  // 2. K-tuple extraction
  let kTuples = arsResponseToKTuples(arsResponse);
  if (kTuples.length === 0) kTuples = await extractViaOllama(query, domain);

  // 3–5. Graph → pathway model → simulation
  const causalGraph   = buildCausalGraph(kTuples);
  const pathwayModel  = buildPathwayModel(causalGraph);
  const { trajectory, steadyState, converged } = runEuler(pathwayModel);

  const meanConf = kTuples.length > 0
    ? kTuples.reduce((s, t) => s + t.confidence, 0) / kTuples.length
    : 0;

  return {
    sessionId,
    kTuples,
    causalGraph,
    pathwayModel,
    simulation: { trajectory, steadyState, converged },
    confidence: (arsResponse.confidence as number | undefined) ?? meanConf,
  };
}
