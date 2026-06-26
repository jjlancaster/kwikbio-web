import { NextRequest, NextResponse } from "next/server";
import type { PathwayModel, SimulationTrajectory } from "@/lib/types";

interface SimulateResult extends SimulationTrajectory {
  converged: boolean;
  steadyState: Record<string, number>;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    pathwayModel?: PathwayModel;
    steps?: number;
    dt?: number;
  };

  const { pathwayModel, steps = 100, dt = 0.05 } = body;

  if (!pathwayModel?.nodes?.length) {
    return NextResponse.json({ error: "pathwayModel.nodes required" }, { status: 400 });
  }

  const result = runEuler(pathwayModel, steps, dt);
  return NextResponse.json(result);
}

function runEuler(model: PathwayModel, steps: number, dt: number): SimulateResult {
  const nodeIds = model.nodes.map((n) => n.id);

  // Initialize all nodes to baseline activation 0.1
  const state: Record<string, number> = {};
  for (const node of model.nodes) state[node.id] = 0.1;

  const timepoints: number[] = [];
  const states: Record<string, number[]> = {};
  for (const id of nodeIds) states[id] = [];

  let converged = false;

  for (let step = 0; step < steps; step++) {
    timepoints.push(+(step * dt).toFixed(4));
    for (const id of nodeIds) states[id].push(+state[id].toFixed(6));

    const next: Record<string, number> = { ...state };
    let maxDelta = 0;

    for (const node of model.nodes) {
      const decay = (model.params as Record<string, number>)[`decay_${node.id}`] ?? 0.1;
      const input = (model.params as Record<string, number>)[`input_${node.id}`] ?? 0.0;
      let flux = -decay * state[node.id] + input;

      for (const edge of model.edges) {
        if ((edge as unknown as { target: string }).target === node.id) {
          const e = edge as unknown as { source: string; target: string; relation: string; weight: number };
          const inhibitory = /inhibit|suppress|block|inactivat/i.test(e.relation ?? "");
          const w = inhibitory ? -Math.abs(e.weight ?? 0.5) : Math.abs(e.weight ?? 0.5);
          flux += w * state[e.source];
        }
      }

      const delta = dt * flux;
      next[node.id] = Math.max(0, state[node.id] + delta);
      maxDelta = Math.max(maxDelta, Math.abs(delta));
    }

    Object.assign(state, next);
    if (maxDelta < 0.001) { converged = true; break; }
  }

  return { timepoints, states, converged, steadyState: { ...state } };
}
