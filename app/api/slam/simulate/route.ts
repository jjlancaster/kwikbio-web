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

  return NextResponse.json(runEuler(pathwayModel, steps, dt));
}

function runEuler(model: PathwayModel, steps: number, dt: number): SimulateResult {
  const nodeIds = model.nodes.map((n) => n.id);

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
      const decay = model.params[`decay_${node.id}`] ?? 0.1;
      const input = model.params[`input_${node.id}`] ?? 0.0;
      let flux = -decay * state[node.id] + input;

      for (const edge of model.edges) {
        if (edge.target === node.id) {
          const inhibitory = /inhibit|suppress|block|inactivat/i.test(edge.relation);
          const w = inhibitory ? -Math.abs(edge.weight) : Math.abs(edge.weight);
          flux += w * state[edge.source];
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
