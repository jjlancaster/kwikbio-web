import Link from "next/link";
import ARSQueryBox from "@/components/ARSQueryBox";
import Verticals from "@/components/Verticals";
import CTAButton from "@/components/CTAButton";

const SOCIAL_PROOF = ["MIT", "NIH", "Johns Hopkins", "Mayo Clinic"];

const HOME_TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    points: ["5 ARS queries", "1 Gateway"],
    cta: "Start →",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Researcher",
    price: "$8",
    cadence: "/mo",
    points: ["Unlimited queries", "All Gateways", "All courses"],
    cta: "Start →",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Lab / Org",
    price: "$20",
    cadence: "/mo",
    points: ["Team seats", "Shared SSKM", "CRO routing", "API access"],
    cta: "Contact",
    href: "mailto:sales@kwikbio.com",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — the query box IS the hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs uppercase tracking-wider text-slate-500">
          <span>Powered by FastScience!™ v7</span>
          <span aria-hidden>·</span>
          <span>US Patent 11,282,088</span>
        </div>

        <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Your next breakthrough is buried in 10,000 papers
          <br className="hidden md:block" /> you don&apos;t have time to read.
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          ARS compresses months of literature mining, hypothesis ranking, and
          CRO sourcing into hours.
        </p>

        <ARSQueryBox />
      </section>

      {/* Social proof */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
            <span className="uppercase tracking-wider text-xs">
              Trusted by researchers at
            </span>
            {SOCIAL_PROOF.map((o) => (
              <span key={o} className="text-slate-700">
                {o}
              </span>
            ))}
          </div>
          <p className="mt-4 text-slate-600 italic">
            &ldquo;Compressed 6 months of lit review into 4 hours.&rdquo;
            <span className="not-italic text-slate-400"> — Dr. [beta tester]</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: "1",
              t: "Ask",
              d: "Drop your research question.",
            },
            {
              n: "2",
              t: "Explore",
              d: "ARS maps ≤9 dominant entities + the top hypotheses.",
            },
            {
              n: "3",
              t: "Run",
              d: "Ranked experiments → matched CROs at 6% commission.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-lg border border-slate-200 p-6 transition hover:border-brand-600"
            >
              <div className="text-sm font-bold tracking-wider text-brand-700">
                STEP {s.n}
              </div>
              <div className="mt-2 text-lg font-semibold">{s.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>

        <details className="group mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand-700 marker:content-none">
            + Under the Hood: PRISM-9 · Fractal Cube-27 · QUBO · SSKM
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <strong>PRISM-9</strong> reduces your question to the ≤9 dominant
            entities that actually drive the system.{" "}
            <strong>Fractal Cube-27</strong> fans those nodes into 27 sub-factors.{" "}
            <strong>QUBO</strong> path-planning surfaces the most causally
            coherent hypotheses across your knowledge graph, and every loop feeds
            your <strong>SSKM</strong> (Studied System Knowledge Model) — so the
            engine gets sharper with each query.
          </p>
        </details>
      </section>

      {/* Verticals */}
      <div className="border-t border-slate-200 bg-white">
        <Verticals />
      </div>

      {/* Pricing teaser */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center">Simple pricing</h2>
          <p className="mt-3 text-center text-slate-600">
            Start free. Upgrade when your research demands it.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOME_TIERS.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col rounded-xl border bg-white p-6 ${
                  t.highlight
                    ? "border-brand-600 shadow-lg"
                    : "border-slate-200"
                }`}
              >
                {t.highlight && (
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{t.price}</span>
                  <span className="text-sm text-slate-500">{t.cadence}</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                  {t.points.map((p) => (
                    <li key={p}>· {p}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <CTAButton
                    href={t.href}
                    variant={t.highlight ? "primary" : "secondary"}
                  >
                    {t.cta}
                  </CTAButton>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              See full pricing & FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to ask the next question faster?</h2>
        <p className="mt-4 text-slate-600">
          Your first ARS query is free — no signup, no card.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CTAButton href="/signup" variant="primary">
            Start Free
          </CTAButton>
          <CTAButton href="/gateway" variant="secondary">
            Try the Gateway
          </CTAButton>
        </div>
      </section>
    </>
  );
}
