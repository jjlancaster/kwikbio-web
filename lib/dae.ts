// Data Analysis Engine — processes experimental results, extracts triples, updates SSKM
import type { KTuple, DAEResult } from './types';

const OLLAMA_URL   = process.env.OLLAMA_URL        ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL      ?? 'hermes3:8b';
const ARS_GATEWAY  = process.env.ARS_GATEWAY_URL   ?? 'http://localhost:5000';

function classify(c: number): 'green' | 'yellow' | 'red' {
  return c >= 0.7 ? 'green' : c >= 0.4 ? 'yellow' : 'red';
}

function detectAnomalies(triples: KTuple[]): string[] {
  const anomalies: string[] = [];

  // Contradictory relations
  const contradictions = triples.filter(t =>
    triples.some(o =>
      o.subject === t.subject && o.object === t.object &&
      o.relation !== t.relation && o.confidence > 0.5
    )
  );
  if (contradictions.length > 0)
    anomalies.push(`${contradictions.length} contradictory relation(s) — manual review recommended`);

  // Low-confidence majority
  const lowConf = triples.filter(t => t.confidence < 0.4);
  if (triples.length > 0 && lowConf.length / triples.length > 0.5)
    anomalies.push(`${Math.round((lowConf.length / triples.length) * 100)}% of triples have confidence <0.4`);

  return anomalies;
}

export async function analyzeResults(rawResults: string, sessionId?: string): Promise<DAEResult> {
  const id = sessionId ?? crypto.randomUUID();
  let triples: KTuple[] = [];

  // Extract triples via Ollama hermes3:8b
  try {
    const prompt =
      `You are a scientific data extraction engine.\n` +
      `Analyze these experimental results and extract knowledge triples.\n\n` +
      `Results:\n${rawResults}\n\n` +
      `Output ONLY a JSON array:\n` +
      `[{"subject":"entity","relation":"activates|inhibits|associates_with|causes|regulates|binds|produces|prevents","object":"entity","confidence":0.0-1.0}]`;

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal:  AbortSignal.timeout(60_000),
    });
    if (res.ok) {
      const data = await res.json() as { response: string };
      const m = data.response.match(/\[[\s\S]*\]/);
      if (m) triples = JSON.parse(m[0]) as KTuple[];
    }
  } catch { /* extraction failed */ }

  // Confidence summary
  const green  = triples.filter(t => classify(t.confidence) === 'green').length;
  const yellow = triples.filter(t => classify(t.confidence) === 'yellow').length;
  const red    = triples.filter(t => classify(t.confidence) === 'red').length;
  const mean   = triples.length > 0 ? triples.reduce((s, t) => s + t.confidence, 0) / triples.length : 0;

  const anomalies = detectAnomalies(triples);

  // Write confirmed triples back to ARS Gateway
  const confirmed = triples.filter(t => t.confidence >= 0.5);
  let sskmUpdate = { newNodes: [] as string[], updatedEdges: [] as string[], confidenceDelta: 0 };

  if (confirmed.length > 0) {
    try {
      await fetch(`${ARS_GATEWAY}/v1/ingest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assertions: confirmed.map(t => ({
            subject: t.subject, predicate: t.relation, object: t.object,
            confidence: t.confidence, source: `dae-${id}`,
          })),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      const allEntities = [...new Set([...confirmed.map(t => t.subject), ...confirmed.map(t => t.object)])];
      sskmUpdate = {
        newNodes:        allEntities,
        updatedEdges:    confirmed.map(t => `${t.subject}→${t.object}`),
        confidenceDelta: mean - 0.5,
      };
    } catch { /* SSKM update failed — data extracted, not ingested */ }
  }

  return {
    sessionId: id,
    extractedTriples:  triples,
    confidenceSummary: { green, yellow, red, mean },
    anomalies,
    voiDelta: green * 0.1 + yellow * 0.05 - red * 0.02,
    sskmUpdate,
  };
}
