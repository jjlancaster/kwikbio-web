import pool from './pg';
import type { RDFQuad } from '../types';

function toRow(q: RDFQuad) {
  return [q.subject, q.predicate, q.object, q.graphName ?? 'public', q.metadata ?? null];
}

export async function insertQuad(quad: RDFQuad): Promise<void> {
  await pool.query(
    'INSERT INTO gs_quads (subject, predicate, object, graph_name, metadata) VALUES ($1,$2,$3,$4,$5)',
    toRow(quad),
  );
}

export async function insertQuads(quads: RDFQuad[]): Promise<void> {
  if (quads.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const q of quads) {
      await client.query(
        'INSERT INTO gs_quads (subject, predicate, object, graph_name, metadata) VALUES ($1,$2,$3,$4,$5)',
        toRow(q),
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function queryBySubject(subject: string, graphName = 'public'): Promise<RDFQuad[]> {
  const { rows } = await pool.query(
    'SELECT * FROM gs_quads WHERE subject=$1 AND graph_name=$2 ORDER BY created_at DESC',
    [subject, graphName],
  );
  return rows.map((r) => ({ subject: r.subject, predicate: r.predicate, object: r.object, graphName: r.graph_name, metadata: r.metadata }));
}

export async function queryByPattern(
  subject?: string, predicate?: string, object?: string, graphName = 'public', limit = 100,
): Promise<RDFQuad[]> {
  const conds: string[] = ['graph_name=$1'];
  const vals: unknown[] = [graphName];
  let i = 2;
  if (subject)   { conds.push(`subject=$${i++}`);   vals.push(subject); }
  if (predicate) { conds.push(`predicate=$${i++}`);  vals.push(predicate); }
  if (object)    { conds.push(`object=$${i++}`);     vals.push(object); }
  vals.push(limit);
  const { rows } = await pool.query(
    `SELECT * FROM gs_quads WHERE ${conds.join(' AND ')} ORDER BY created_at DESC LIMIT $${i}`,
    vals,
  );
  return rows.map((r) => ({ subject: r.subject, predicate: r.predicate, object: r.object, graphName: r.graph_name, metadata: r.metadata }));
}

export async function getNeighbours(nodeId: string, graphName = 'public'): Promise<string[]> {
  const { rows: fwd } = await pool.query(
    'SELECT object FROM gs_quads WHERE subject=$1 AND graph_name=$2', [nodeId, graphName]);
  const { rows: rev } = await pool.query(
    'SELECT subject FROM gs_quads WHERE object=$1 AND graph_name=$2', [nodeId, graphName]);
  return [...fwd.map((r) => r.object as string), ...rev.map((r) => r.subject as string)];
}
