import { NextRequest, NextResponse } from "next/server";
import { insertQuads } from "@/lib/db/quadstore";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "hermes3:8b";

interface RawTriple {
  subject: string;
  predicate: string;
  object: string;
  confidence?: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { text?: string; graphName?: string };
  const text = (body.text ?? "").trim();
  const graphName = body.graphName ?? "public";

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const prompt = `Extract knowledge graph triples from the following scientific text. Return a JSON array where each element has exactly: subject (string), predicate (string), object (string), confidence (number 0-1).

Text:
${text}

Return ONLY a valid JSON array. Example: [{"subject":"BRCA1","predicate":"inhibits","object":"tumor_growth","confidence":0.9}]`;

  let triples: RawTriple[] = [];
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(30_000),
    });
    if (resp.ok) {
      const data = await resp.json() as { response?: string };
      const raw = data.response ?? "[]";
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) triples = JSON.parse(match[0]) as RawTriple[];
    }
  } catch {
    // Ollama unreachable
  }

  let inserted = 0;
  if (triples.length > 0) {
    const quads = triples.map((t) => ({
      subject: t.subject,
      predicate: t.predicate,
      object: t.object,
      graph_name: graphName,
      metadata: { confidence: t.confidence ?? 0.5, source: "api-ingest" },
    }));
    try {
      await insertQuads(quads);
      inserted = quads.length;
    } catch {
      // Supabase not configured
    }
  }

  return NextResponse.json({ triples, inserted, graphName });
}
