import PricingCard, { type Tier } from "@/components/PricingCard";

const tiers: Tier[] = [
  {
    name: "Curious",
    price: "$0",
    cadence: "/mo",
    limit: "5 ARS queries / month",
    features: [
      "1 Gateway (Biomedical)",
      "PRISM-9 problem reduction",
      "Read-only knowledge graph",
      "Community support",
    ],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Educational",
    price: "$8",
    cadence: "/mo",
    limit: "Unlimited queries",
    highlight: true,
    features: [
      "All Gateways",
      "Cube-27 deep expansion",
      "All courses included",
      "Personal SSKM (knowledge graph)",
      "Email support",
    ],
    cta: "Choose Educational",
    href: "/signup",
  },
  {
    name: "Grad",
    price: "$88",
    cadence: "/mo",
    limit: "Everything in Educational, plus",
    features: [
      "Ranked experiment suggestions",
      "CRO matching + booking (6% pass-through)",
      "ExpChooser access",
      "Priority support",
    ],
    cta: "Choose Grad",
    href: "/signup",
  },
  {
    name: "Professional",
    price: "$888",
    cadence: "/mo",
    limit: "Multi-seat full stack",
    features: [
      "Team seats + shared SSKM",
      "SysSim full causal-dynamic simulation",
      "Private PRISM-9 weights",
      "API access + CRO routing",
      "Dedicated success engineer",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@kwikbio.com",
  },
];

const faqs = [
  {
    q: "What's an 'ARS query'?",
    a: "One full pass of the Automated Research System loop — your question through PRISM-9 reduction, Cube-27 expansion, QUBO path-planning, and a ranked output of experiment proposals. Most users use 1–3 per active research thread.",
  },
  {
    q: "How does the 6% CRO commission work?",
    a: "When kwiKBio matches you to a CRO and you book through us, we collect a flat 6% commission from the CRO — it never marks up your invoice. The CRO sees the same booking they'd get from a cold-email lead, minus their normal sales cost.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly plans cancel at period end, no questions asked. Your Studied System Knowledge Model exports to RDF/Turtle on request.",
  },
  {
    q: "Is my research private?",
    a: "Your SSKM (Studied System Knowledge Model) is scoped to your tenant. We never train shared models on tenant data without explicit written consent.",
  },
  {
    q: "What runs on Professional that doesn't on Grad?",
    a: "SysSim (full causal-dynamic simulation), private PRISM-9 weights, multi-seat team access with a shared SSKM, API access, and a named success engineer.",
  },
];

export const metadata = {
  title: "Pricing — kwiKBio",
  description:
    "Four tiers from free to enterprise. Transparent 6% CRO pass-through. No hidden markup.",
};

export default function PricingPage() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center">Pricing</h1>
        <p className="text-center text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
          Start free. Upgrade when your research demands it. The CRO commission
          is a flat 6% pass-through — you only pay for what you book, and there&apos;s
          no markup on your invoice.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <PricingCard key={t.name} tier={t} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Pricing FAQ</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <div className="font-semibold text-slate-900">{f.q}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
