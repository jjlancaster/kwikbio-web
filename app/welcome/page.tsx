import Hero from "@/components/Hero";
import CTAButton from "@/components/CTAButton";

export default function WelcomePage() {
  return (
    <>
      <Hero />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How kwiKBio works — in 3 steps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "1", t: "Ask", d: "Drop your research question into the ARS Gateway. PRISM-9 reduces it to the ≤9 dominant entities that actually drive your system." },
            { n: "2", t: "Explore", d: "Fractal Cube-27 expansion fans those 9 nodes into 27 sub-factors. QUBO path-planning surfaces the most causally coherent hypotheses across your knowledge graph." },
            { n: "3", t: "Run", d: "Ranked experiments route to matched CROs at a transparent 6% commission. Results feed back into your Studied System Knowledge Model — every loop, smarter." },
          ].map(s => (
            <div key={s.n} className="border border-slate-200 rounded-lg p-6 hover:border-brand-600 transition">
              <div className="text-brand-700 font-bold text-sm tracking-wider">STEP {s.n}</div>
              <div className="font-semibold mt-2 text-lg">{s.t}</div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why now */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold">Why now</h2>
              <p className="mt-4 text-slate-700 leading-relaxed">
                The bottleneck in modern biomedical research isn&apos;t experimental capacity — it&apos;s the
                weeks of literature review, hypothesis ranking, and CRO sourcing between question
                and lab. FastScience! has been compressing that loop since 1993. Version 7, shipping
                in 2026, is the first to close it end-to-end on quantum-class hardware.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              {[
                { v: "33 years", l: "of FastScience! methodology refinement" },
                { v: "11,282,088", l: "US patent backing the ARS engine" },
                { v: "≤9 entities", l: "PRISM-9 problem reduction guarantee" },
                { v: "6%", l: "transparent CRO commission — no hidden markup" },
              ].map(s => (
                <div key={s.v} className="flex gap-4 border-l-4 border-brand-600 pl-4">
                  <div className="font-mono font-bold text-brand-700 text-lg">{s.v}</div>
                  <div className="text-slate-700 self-center">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center">Domains in flight</h2>
        <p className="text-center text-slate-600 mt-3 max-w-2xl mx-auto">
          We&apos;re scoping vertical slices in priority order. Microbial consortia bioenergy is the
          first production-ready demonstration domain.
        </p>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Microbial Bioenergy", s: "Live", c: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { t: "Drug Discovery", s: "Beta Q3", c: "bg-amber-50 text-amber-700 border-amber-200" },
            { t: "Rare Disease", s: "Scoping", c: "bg-slate-50 text-slate-700 border-slate-200" },
            { t: "Climate / Carbon", s: "Scoping", c: "bg-slate-50 text-slate-700 border-slate-200" },
          ].map(d => (
            <div key={d.t} className="border border-slate-200 rounded-lg p-5">
              <div className={`text-xs uppercase tracking-wider inline-block px-2 py-0.5 rounded border ${d.c}`}>{d.s}</div>
              <div className="font-semibold mt-3">{d.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-slate-900 text-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold">Built inside the HydroJoule ecosystem</h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            kwiKBio Inc. is a subsidiary of HydroJoule LLC. Sibling verticals share the same FastScience! v7
            substrate — Climate Research Inc., Vermont Medical College, and the LOOJL legal practice.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
            <a href="https://biounicorn.ai" className="text-brand-100 hover:text-white underline-offset-4 hover:underline">BioUnicorn.ai →</a>
            <a href="https://crowdcuredisease.ai" className="text-brand-100 hover:text-white underline-offset-4 hover:underline">CrowdCureDisease.ai →</a>
            <a href="https://vermontmedicalcollege.com" className="text-brand-100 hover:text-white underline-offset-4 hover:underline">VermontMedicalCollege.com →</a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to ask the next question faster?</h2>
        <p className="mt-4 text-slate-600">
          Start free — five ARS queries every month, no card required.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <CTAButton href="/pricing" variant="primary">Start Free</CTAButton>
          <CTAButton href="/navigator" variant="secondary">Open the Navigator</CTAButton>
        </div>
      </section>
    </>
  );
}
