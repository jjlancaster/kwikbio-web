import PricingCard, { type Tier } from "@/components/PricingCard";

  const tiers: Tier[] = [
    { name: "Freemium", price: "$0", cadence: "/mo", limit: "5 ARS queries / month",
      features: ["Read-only KG access", "Basic FastScience! summary", "Community support"],
      cta: "Start Free", href: "/api/subscribe" },
    { name: "Explorer", price: "$9", cadence: "/mo", limit: "50 queries / month",
      features: ["Basic graph access", "PRISM-9 summaries", "Email support"],
      cta: "Choose Explorer", href: "/api/subscribe" },
    { name: "Researcher", price: "$29", cadence: "/mo", limit: "Unlimited queries", highlight: true,
      features: ["Experiment suggestions", "Cube-27 deep expansion", "Priority support"],
      cta: "Choose Researcher", href: "/api/subscribe" },
    { name: "Pro", price: "$99", cadence: "/mo", limit: "Unlimited + CRO access",
      features: ["CRO matching", "ExpChooser access", "6% transparent CRO commission"],
      cta: "Choose Pro", href: "/api/subscribe" },
    { name: "Enterprise", price: "$900", cadence: "/mo", limit: "Multi-seat full stack",
      features: ["PRISM-9 + SysSim", "Custom domain manuals", "Dedicated success engineer"],
      cta: "Contact Sales", href: "mailto:sales@kwikbio.com" },
  ];

  export const metadata = { title: "Pricing — kwiKBio" };

  export default function PricingPage() {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center">Pricing</h1>
        <p className="text-center text-slate-600 mt-3 max-w-2xl mx-auto">
          Start free. Upgrade when your research demands it. CRO commission is a transparent 6% pass-through —
          you only pay for what you book.
        </p>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map(t => <PricingCard key={t.name} tier={t} />)}
        </div>
      </section>
    );
  }
  