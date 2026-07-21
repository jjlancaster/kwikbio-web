import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "hermes3:8b";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get("term") ?? "").trim();

  if (!term) return NextResponse.json({ error: "term required" }, { status: 400 });

  const prompt = `List 8 closely related scientific or biological terms to "${term}". Focus on molecular mechanisms, pathways, proteins, genes, or compounds relevant to biomedical research. Return ONLY a JSON array of strings with no explanation. Example: ["term1","term2","term3","term4","term5","term6","term7","term8"]`;

  let terms: string[] = [];
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(20_000),
    });
    if (resp.ok) {
      const data = await resp.json() as { response?: string };
      const raw = data.response ?? "[]";
      const match = raw.match(/\[[\s\S]*?\]/);
      if (match) terms = JSON.parse(match[0]) as string[];
    }
  } catch {
    // Ollama unreachable — return generic expansions
  }

  if (terms.length === 0) {
    terms = [
      `${term} pathway`,
      `${term} inhibitor`,
      `${term} receptor`,
      `${term} gene`,
      `${term} protein`,
      `${term} expression`,
      `${term} mutation`,
      `${term} signaling`,
    ];
  }

  return NextResponse.json({ term, terms: terms.slice(0, 8) });
}
