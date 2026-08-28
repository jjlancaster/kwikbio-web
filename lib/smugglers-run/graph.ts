// Jewel graph writes for finished races (local Postgres, lib/db/pg.ts).
// Spec: gs_nodes (winner, loser, delta_ms, timestamp) + gs_edges player→race
// COMPETED_IN. Edges FK onto gs_nodes.node_id, so player nodes go in first.

import { query } from '../db/pg';
import type { MatchRecord } from './types';

const NODE_SQL = `
  INSERT INTO gs_nodes (node_id, label, node_type, confidence, uncertainty,
                        source_type, source_id, provenance)
  VALUES ($1, $2, $3, 1, 0, 'smugglers-run', $4, $5)
  ON CONFLICT (node_id) DO UPDATE SET label = EXCLUDED.label, provenance = EXCLUDED.provenance`;

const EDGE_SQL = `
  INSERT INTO gs_edges (edge_id, source_node, target_node, relation, confidence,
                        uncertainty, source_type, source_id, provenance)
  VALUES ($1, $2, $3, 'COMPETED_IN', 1, 0, 'smugglers-run', $4, $5)
  ON CONFLICT (edge_id) DO NOTHING`;

export async function writeRaceToGraph(m: MatchRecord): Promise<void> {
  if (!m.result || !m.guest) return;

  const raceNodeId = `sr:race:${m.token}`;
  const winner = m.result.winnerId === m.host.id ? m.host : m.guest;
  const loser  = m.result.winnerId === m.host.id ? m.guest : m.host;

  await query(NODE_SQL, [
    raceNodeId, `Smuggler's Run race ${m.token}`, 'sr_race', m.token,
    JSON.stringify({
      winner: winner.id,
      loser: loser.id,
      delta_ms: m.result.deltaMs,
      timestamp: m.result.recordedAt,
      decided_by: m.result.decidedBy,
      host_time_ms: m.host.finishMs,
      guest_time_ms: m.guest.finishMs,
    }),
  ]);
  for (const p of [m.host, m.guest]) {
    await query(NODE_SQL, [
      `sr:player:${p.id}`, p.name, 'sr_player', p.id, JSON.stringify({ skin: p.skin }),
    ]);
  }
  for (const p of [m.host, m.guest]) {
    await query(EDGE_SQL, [
      `sr:edge:${m.token}:${p.id}`, `sr:player:${p.id}`, raceNodeId, m.token,
      JSON.stringify({
        result: p.id === m.result.winnerId ? 'won' : 'lost',
        time_ms: p.finishMs,
      }),
    ]);
  }
}
