// Prism9 Live Builder — generates a 4-layer causal graph from any keyword.
// Layers: Normal (healthy physiology) | Dysfunction (disease) | Fix (therapies) | Cope (living with it).
// Uses the Anthropic Messages API; falls back to a minimal stub when the key is missing.

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `You are a biomedical knowledge graph expert powering a FastScience! Prism9 visualisation tool.

Given any biological topic, disease, gene, pathway, or concept, produce a causal graph structured into exactly four layers:

NORMAL — The healthy biological system before any disease or disruption.
  • Describe normal physiology only. No reference to disease, disorder, or therapy.
  • Include key proteins, pathways, cells, and regulatory mechanisms.

DYSFUNCTION — How the disease or condition disrupts normal function.
  • Show the causal chain of breakdown: what fails, what it causes, what cascades.
  • Named the disease clearly. Be mechanistic and specific.

FIX — Therapy pathways and treatment strategies.
  • Specific named drugs, procedures, gene therapies, or interventions.
  • Include confidence (0.0–1.0) and mechanism for each node.

COPE — Strategies for living with or managing the condition.
  • Quality of life, rehabilitation, adaptive strategies, support, lifestyle.
  • No therapy targets — this is about living well, not curing.

Return ONLY valid JSON in this exact schema (no markdown, no backticks, no commentary):

{
  "subject": "<canonical subject name>",
  "prism9": {
    "normal": {
      "title": "<title>",
      "summary": "<2–3 sentences describing the healthy system>",
      "nodes": [
        { "id": "n1", "label": "<entity name>", "definition": "<one clear sentence>", "role": "<physiological role>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "dysfunction": {
      "title": "<disease or condition name>",
      "summary": "<2–3 sentences on how the system fails>",
      "nodes": [
        { "id": "d1", "label": "<entity name>", "definition": "<one clear sentence>", "role": "<dysfunction role>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "fix": {
      "title": "Therapy Pathways",
      "summary": "<2–3 sentences on treatment approach>",
      "nodes": [
        { "id": "f1", "label": "<therapy / drug>", "definition": "<one clear sentence>", "role": "<mechanism>", "confidence": 0.0 }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "cope": {
      "title": "Living with <subject>",
      "summary": "<2–3 sentences on quality of life>",
      "nodes": [
        { "id": "c1", "label": "<strategy or resource>", "definition": "<one clear sentence>", "role": "<category>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    }
  }
}

Rules:
• 4–9 nodes per layer; 2–8 edges per layer.
• Use real biomedical entities and accurate current knowledge.
• Edge "from"/"to" must match node ids within the same layer.
• Keep definitions concise — one sentence only.
• Output pure JSON, nothing else.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const keyword = String(body?.keyword ?? "").trim();
  if (!keyword) {
    return NextResponse.json({ ok: false, error: "keyword required" }, { status: 400 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "LLM not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Build a Prism9 causal graph for: ${keyword}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    const rawText: string = data?.content?.[0]?.text ?? "";

    // Attempt to extract valid JSON from the response.
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("LLM did not return parseable JSON");
      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json({ ok: true, ...(parsed as object) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[prism9/live]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }
}
