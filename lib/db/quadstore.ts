import { getSupabase } from './supabase';
import type { RDFQuad } from '../types';

function toRow(q: RDFQuad) {
  return {
    subject:    q.subject,
    predicate:  q.predicate,
    object:     q.object,
    graph_name: q.graphName ?? 'public',
    metadata:   q.metadata ?? null,
  };
}

function fromRow(r: Record<string, unknown>): RDFQuad {
  return {
    subject:   r.subject as string,
    predicate: r.predicate as string,
    object:    r.object as string,
    graphName: r.graph_name as string,
    metadata:  r.metadata as RDFQuad['metadata'],
  };
}

export async function insertQuad(quad: RDFQuad): Promise<void> {
  const { error } = await getSupabase().from('gs_quads').insert(toRow(quad));
  if (error) throw new Error(`insertQuad: ${error.message}`);
}

export async function insertQuads(quads: RDFQuad[]): Promise<void> {
  if (quads.length === 0) return;
  const { error } = await getSupabase().from('gs_quads').insert(quads.map(toRow));
  if (error) throw new Error(`insertQuads: ${error.message}`);
}

export async function queryBySubject(subject: string, graphName = 'public'): Promise<RDFQuad[]> {
  const { data, error } = await getSupabase()
    .from('gs_quads')
    .select('*')
    .eq('subject', subject)
    .eq('graph_name', graphName)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`queryBySubject: ${error.message}`);
  return (data ?? []).map(fromRow);
}

export async function queryByPattern(
  subject?: string,
  predicate?: string,
  object?: string,
  graphName = 'public',
  limit = 100,
): Promise<RDFQuad[]> {
  let q = getSupabase().from('gs_quads').select('*').eq('graph_name', graphName);
  if (subject)   q = q.eq('subject', subject);
  if (predicate) q = q.eq('predicate', predicate);
  if (object)    q = q.eq('object', object);
  const { data, error } = await q.order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(`queryByPattern: ${error.message}`);
  return (data ?? []).map(fromRow);
}

export async function getNeighbours(nodeId: string, graphName = 'public'): Promise<string[]> {
  const sb = getSupabase();
  const [fwd, rev] = await Promise.all([
    sb.from('gs_quads').select('object').eq('subject', nodeId).eq('graph_name', graphName),
    sb.from('gs_quads').select('subject').eq('object', nodeId).eq('graph_name', graphName),
  ]);
  return [
    ...((fwd.data ?? []).map((r: Record<string, unknown>) => r.object as string)),
    ...((rev.data ?? []).map((r: Record<string, unknown>) => r.subject as string)),
  ];
}
