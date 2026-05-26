import Hero from "@/components/Hero";

  export default function HomePage() {
    return (
      <>
        <Hero />
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">How kwiKBio works — in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Ask", d: "Drop your research question into the ARS Gateway. PRISM-9 reduces it to ≤9 dominant entities." },
              { n: "2", t: "Explore", d: "Fractal Cube-27 expansion + QUBO path planning surface causal hypotheses across the knowledge graph." },
              { n: "3", t: "Run", d: "Ranked experiments routed to matched CROs. Results feed back into your Studied System Knowledge Model." },
            ].map(s => (
              <div key={s.n} className="border border-slate-200 rounded-lg p-6">
                <div className="text-brand-700 font-bold text-sm">STEP {s.n}</div>
                <div className="font-semibold mt-1">{s.t}</div>
                <p className="text-sm text-slate-600 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }
  