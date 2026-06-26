import { NextRequest } from "next/server";

export interface ARSResult {
  node_id: string;
  title: string;
  hypothesis: string;
  confidence: number;
  evidence_count: number;
  sources: string[];
}

const MOCK_RESULTS: Record<string, ARSResult[]> = {
  drug: [
    {
      node_id: "hyp-001",
      title: "CDK9 / BRD4 co-targeting in TNF-α-driven autoimmune loops",
      hypothesis:
        "CDK9 and BRD4 form a functional dependency node downstream of TNF-α receptor activation in CD4+ T-cell signaling cascades. Dual inhibition shows synergistic anti-inflammatory effect in 14 of 18 curated ChEMBL assay pairs.",
      confidence: 0.87,
      evidence_count: 42,
      sources: ["ChEMBL", "PubChem", "PRISM-9 graph v3.1"],
    },
    {
      node_id: "hyp-002",
      title: "JAK1 isoform selectivity re-ranks approved inhibitors",
      hypothesis:
        "Isoform-resolved JAK1 binding pocket analysis re-ranks tofacitinib, baricitinib, and upadacitinib on TNF-α pathway suppression. Upadacitinib emerges as strongest mechanistic overlap candidate for non-IBD autoimmune targets.",
      confidence: 0.79,
      evidence_count: 31,
      sources: ["UniProt", "ChEMBL", "PubChem"],
    },
    {
      node_id: "hyp-003",
      title: "IL-6 trans-signaling vs. classic signaling split",
      hypothesis:
        "Graph topology analysis separates IL-6 trans-signaling from classic signaling with 94% partition fidelity. Trans-signaling arm is selectively co-clustered with TNF-α in 7 of 9 autoimmune microenvironment embeddings.",
      confidence: 0.72,
      evidence_count: 28,
      sources: ["PubChem", "PRISM-9 graph v3.1"],
    },
  ],
  bioenergy: [
    {
      node_id: "hyp-b01",
      title: "Methanosaeta + Syntrophus acetoxidans consortium peak yield",
      hypothesis:
        "Syntrophic pairing of Methanosaeta thermophila with Syntrophus acetoxidans achieves 38% higher methane yield vs. monoculture in corn-stover digestate simulations. Acetate cross-feeding rate is the binding constraint.",
      confidence: 0.91,
      evidence_count: 57,
      sources: ["PRISM-9 graph v3.1", "NCBI 16S", "JGI IMG"],
    },
    {
      node_id: "hyp-b02",
      title: "pH 7.2 acetoclastic methanogenesis optimum",
      hypothesis:
        "Metabolic pathway flux modeling pins acetoclastic methanogenesis efficiency peak at pH 7.2 ± 0.15, with corn-stover particle size <2 mm as a co-determining variable for accessible surface area.",
      confidence: 0.84,
      evidence_count: 39,
      sources: ["PRISM-9 graph v3.1"],
    },
    {
      node_id: "hyp-b03",
      title: "Hydrogenotrophic backup pathway at elevated H₂ partial pressure",
      hypothesis:
        "Above 15 Pa H₂ partial pressure, Methanospirillum hungatei activates a hydrogenotrophic bypass that rescues overall methane yield by 11–17%. Monitoring dissolved H₂ in real-time is recommended as a control variable.",
      confidence: 0.68,
      evidence_count: 22,
      sources: ["JGI IMG", "PRISM-9 graph v3.1"],
    },
  ],
  climate: [
    {
      node_id: "hyp-c01",
      title: "Fungal necromass + clay mineral binding stabilizes biochar C",
      hypothesis:
        "Fungal necromass accumulation co-localized with 2:1 clay minerals (illite, smectite) is the strongest predictor of biochar carbon stability over 10-year horizons. Consortium diversity index > 3.2 Shannon is threshold condition.",
      confidence: 0.83,
      evidence_count: 44,
      sources: ["PRISM-9 graph v3.1", "NCBI SRA"],
    },
    {
      node_id: "hyp-c02",
      title: "Bacterial vs. fungal necromass differential stability",
      hypothesis:
        "Bacterial necromass (peptidoglycan-rich) shows 2.3× faster decomposition vs. fungal necromass (chitin-rich) across 9 soil types tested. Fungal pathway is preferred for 10-year+ carbon commitment targets.",
      confidence: 0.76,
      evidence_count: 33,
      sources: ["JGI IMG", "PRISM-9 graph v3.1"],
    },
  ],
  rare: [
    {
      node_id: "hyp-r01",
      title: "Vorinostat HDAC inhibition overlaps NPC1 cholesterol trafficking",
      hypothesis:
        "Mechanistic graph alignment finds vorinostat HDAC inhibition pathway overlapping with NPC1 intracellular cholesterol trafficking at the LAMP1/LAMP2 lysosomal membrane node. Overlap score: 0.81 cosine similarity.",
      confidence: 0.81,
      evidence_count: 29,
      sources: ["ChEMBL", "PRISM-9 graph v3.1", "OMIM"],
    },
    {
      node_id: "hyp-r02",
      title: "Arimoclomol chaperone induction complements NPC1 partial function",
      hypothesis:
        "Arimoclomol, a heat-shock protein co-inducer, shows mechanistic overlap with residual NPC1 partial-function variants at the HSP70/HSP90 chaperone node. Three patient-registry cohorts carry NPC1 variants in this partial-function range.",
      confidence: 0.74,
      evidence_count: 21,
      sources: ["OMIM", "ChEMBL", "PRISM-9 graph v3.1"],
    },
  ],
  custom: [
    {
      node_id: "hyp-x01",
      title: "Domain manual ingestion pending",
      hypothesis:
        "Upload your domain manual (PDF, RDF, or markdown) to generate a custom ARS graph. The PRISM-9 engine will build your knowledge graph and run hypothesis generation within 24 hours.",
      confidence: 0,
      evidence_count: 0,
      sources: [],
    },
  ],
};

const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { domain?: string; query?: string };
  const domain = body?.domain ?? "bioenergy";
  const query = body?.query ?? domain;

  // Try live ARS Gateway first with a 5s connect timeout
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5_000);
    const upstream = await fetch(`${ARS_GATEWAY}/v1/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, domain }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (upstream.ok && upstream.body) {
      return new Response(upstream.body, { headers: SSE_HEADERS });
    }
  } catch {
    // Gateway unreachable — fall through to mock
  }

  // Mock fallback
  const results = MOCK_RESULTS[domain] ?? MOCK_RESULTS.bioenergy;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start", domain })}\n\n`));
      await delay(350);
      for (const result of results) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", ...result })}\n\n`));
        await delay(550);
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, { headers: SSE_HEADERS });
}
