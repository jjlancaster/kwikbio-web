import Link from "next/link";

  export const metadata = {
    title: "Gateway",
    description: "Self-select your research path. Drug discovery, climate, bioenergy, or custom.",
  };

  const branches = [
    {
      k: "drug",
      t: "Drug Discovery",
      d: "Target identification, hit-to-lead, mechanism-of-action queries. Your graph: ChEMBL + PubChem + your private compound library.",
      sample: "Which kinase targets co-cluster with TNF-α in autoimmune signaling cascades?",
    },
    {
      k: "climate",
      t: "Climate & Carbon",
      d: "Carbon-cycle feedbacks, soil microbiome modeling, marine sequestration pathways.",
      sample: "What soil microbial consortia most reliably stabilize biochar carbon over 10-year horizons?",
    },
    {
      k: "bioenergy",
      t: "Bioenergy",
      d: "Microbial consortia for fuel synthesis, metabolic pathway optimization, feedstock matching. Our flagship vertical slice.",
      sample: "Which two-organism consortia maximize methane yield from corn-stover digestate?",
    },
    {
      k: "rare",
      t: "Rare Disease",
      d: "Patient-registry mining, orphan-target prioritization, repurposing candidates.",
      sample: "Which approved drugs share mechanism overlap with NPC1 dysfunction in Niemann–Pick Type C?",
    },
    {
      k: "custom",
      t: "Custom Research",
      d: "Bring your own domain manual. ARS will ingest, build the graph, and scope your problem.",
      sample: "Upload your domain manual (PDF, RDF, or markdown) — we'll generate a graph schema in <24h.",
    },
  ];

  export default function GatewayPage() {
    return (
      <>
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold">Gateway</h1>
          <p className="text-slate-600 mt-4 text-lg">
            Start where you are. Pick the closest match — the ARS engine adapts to your domain manual.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.k} className="border border-slate-200 rounded-lg p-6 hover:border-brand-600 hover:shadow-sm transition cursor-pointer">
                <div className="font-semibold text-lg">{b.t}</div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{b.d}</p>
                <div className="mt-4 text-xs text-slate-500 italic border-l-2 border-slate-300 pl-3">
                  e.g. "{b.sample}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Demo query box */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold">Try a sample ARS query</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Drop your research question. Day-3 wiring sends it to the live PRISM-9 endpoint
              on Jewel — for now, the box previews the input contract.
            </p>
            <form className="mt-6 space-y-3">
              <label htmlFor="ars-query" className="sr-only">
                Research question
              </label>
              <textarea
                id="ars-query"
                name="query"
                className="w-full border border-slate-300 rounded-md p-3 text-sm font-mono bg-white"
                rows={4}
                placeholder="e.g. Which microbial consortia maximize methane yield from agricultural waste?"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  className="bg-brand-600 text-white px-5 py-2 rounded-md hover:bg-brand-700 font-medium"
                >
                  Run PRISM-9
                </button>
                <Link href="/pricing" className="text-sm text-brand-700 self-center hover:underline">
                  Need more queries? See plans →
                </Link>
              </div>
            </form>
          </div>
        </section>
      </>
    );
  }
  