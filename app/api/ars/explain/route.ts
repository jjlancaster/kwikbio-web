import { NextRequest } from "next/server";

// TODO: wire to live ARS Gateway at http://127.0.0.1:5000/v1/query?mode=explain on Jewel
// Replace MOCK_EXPLANATIONS and stream body with a proxied SSE stream:
//   const upstream = await fetch(`${ARS_GATEWAY}/v1/query?mode=explain`, {
//     method: "POST",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify({ node_id, context }),
//   });
//   return new Response(upstream.body, { headers: SSE_HEADERS });

// Canned plain-language explanations keyed by node_id.
const MOCK_EXPLANATIONS: Record<string, string> = {
  "hyp-001":
    "Think of your immune system as a control room with many switches. Two of those switches — CDK9 and BRD4 — sit right next to the alarm button triggered by TNF-α, a protein your body releases during inflammation. This finding says that if you flip both switches off at the same time, you can quiet the alarm more effectively than turning off just one. In 14 out of 18 lab tests, doing that produced a stronger anti-inflammatory result than targeting either switch alone.",
  "hyp-002":
    "JAK1 is a protein that acts like a relay runner passing inflammation signals inside immune cells. Several approved drugs already block JAK1 — tofacitinib, baricitinib, and upadacitinib — but this analysis looked more carefully at exactly which part of JAK1 each drug grabs. The result: upadacitinib lands on the spot most directly linked to TNF-α signaling, making it potentially the better fit for autoimmune conditions outside of gut disease.",
  "hyp-003":
    "IL-6 is an inflammatory messenger protein that can work two different ways: it can signal directly to the same cell that made it (classic), or it can travel and signal to distant cells (trans-signaling). This finding shows the ARS engine can reliably tell these two modes apart, and that the long-distance trans-signaling version is the one that tends to co-activate with TNF-α in inflamed tissue — meaning drugs that specifically block trans-signaling might hit both pathways at once.",
  "hyp-b01":
    "Two microbes working as a team can make more methane from farm waste than either could alone. Methanosaeta handles the final step of converting acetate to methane, while Syntrophus feeds it a steady supply of that acetate. The key bottleneck is how fast Syntrophus passes the baton — if that handoff rate is optimized (right temperature, right pH, right feedstock particle size), the pair produces about 38% more methane per unit of corn waste than a single-microbe setup.",
  "hyp-b02":
    "Methane-producing bacteria are picky about acidity — too acidic or too alkaline and their enzymes slow down. The sweet spot is pH 7.2, which is almost perfectly neutral, similar to drinking water. A second factor matters nearly as much: how finely shredded the corn stalks are. Smaller particles expose more surface area, letting bacteria access the sugars inside faster. Together, pH and particle size explain most of the variation in how much methane a given batch produces.",
  "hyp-b03":
    "Hydrogen is a byproduct of breaking down organic matter, but too much of it in solution actually slows down the microbes doing the work — like exhaust fumes building up in an engine. When hydrogen levels rise above a threshold, a backup species (Methanospirillum) kicks in and converts that excess hydrogen directly into methane. The net effect is an 11–17% yield rescue. Watching dissolved hydrogen levels in real time gives operators an early warning system and a control knob.",
  "hyp-c01":
    "When fungi die in soil, their bodies get glued to certain clay minerals — think of clay as a sticky microscopic sponge. That gluing locks carbon into a form that bacteria can't easily eat, keeping it in the ground for decades instead of escaping as CO₂. Biochar works best as a long-term carbon store when these fungal–clay complexes form around it. The key signal: soils with a Shannon diversity index above 3.2 — meaning a rich mix of fungal species — consistently show the strongest carbon retention.",
  "hyp-c02":
    "Bacteria and fungi both leave behind carbon-rich remains when they die, but the chemistry is different. Bacterial cell walls are made of peptidoglycan, which soil microbes can digest relatively quickly. Fungal cell walls contain chitin — the same stuff in crab shells — which is much tougher and breaks down more slowly. Across nine different soil types, fungal remains lasted 2.3 times longer than bacterial remains. For 10-year+ carbon commitments, encouraging fungi is the better bet.",
  "hyp-r01":
    "NPC1 is a protein that acts like a traffic cop for cholesterol inside cells. When it's broken (as in Niemann-Pick disease), cholesterol piles up in lysosomes — the cell's recycling centers. Vorinostat is a cancer drug that normally works by unblocking gene expression. What's surprising here is that its molecular pathway crosses paths with the same lysosomal membrane machinery NPC1 uses. An 81% similarity score suggests vorinostat might help redirect that cholesterol traffic jam, making it a repurposing candidate worth investigating.",
  "hyp-r02":
    "Chaperone proteins are like quality-control inspectors that help misfolded proteins get back into proper shape. Arimoclomol tells the cell to make more of these inspectors. Some NPC1 mutations don't destroy the protein entirely — they just fold it slightly wrong, leaving it partially functional. If you boost the chaperone workforce, those partially-functional NPC1 proteins can be rescued and returned to duty. Three patient subgroups in existing registries carry exactly the kind of NPC1 variant that would benefit from this approach.",
  "hyp-x01":
    "This is a placeholder result. Once you upload your domain manual, the ARS engine will analyze it, build a custom knowledge graph, and generate findings specific to your research domain. No real analysis has run yet.",
};

const FALLBACK_EXPLANATION =
  "The ARS engine analyzed this hypothesis across its knowledge graph and found statistically significant evidence clusters. The connections identified here are based on co-occurrence patterns, mechanistic pathway overlaps, and literature embeddings — not direct experimental validation. Treat this as a ranked lead for further investigation, not a confirmed finding.";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { node_id?: string; context?: string };
  const nodeId = body?.node_id ?? "";

  const explanation = MOCK_EXPLANATIONS[nodeId] ?? FALLBACK_EXPLANATION;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "start", node_id: nodeId })}\n\n`)
      );
      await delay(200);

      // Stream word by word for a natural typing effect
      const words = explanation.split(" ");
      let chunk = "";
      for (let i = 0; i < words.length; i++) {
        chunk += (i === 0 ? "" : " ") + words[i];
        // Flush every 4 words to balance smoothness vs. round-trips
        if ((i + 1) % 4 === 0 || i === words.length - 1) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "token", text: chunk })}\n\n`)
          );
          chunk = "";
          await delay(60);
        }
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
