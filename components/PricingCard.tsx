import CTAButton from "./CTAButton";

  export interface Tier {
    name: string;
    price: string;
    cadence: string;
    limit: string;
    features: string[];
    highlight?: boolean;
    cta: string;
    href: string;
  }

  export default function PricingCard({ tier }: { tier: Tier }) {
    return (
      <div className={`rounded-xl border p-6 flex flex-col ${tier.highlight ? "border-brand-600 shadow-lg" : "border-slate-200"}`}>
        {tier.highlight && (
          <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-2">Most Popular</div>
        )}
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{tier.price}</span>
          <span className="text-slate-500 text-sm">{tier.cadence}</span>
        </div>
        <div className="text-sm text-slate-600 mt-1">{tier.limit}</div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700 flex-1">
          {tier.features.map(f => <li key={f}>· {f}</li>)}
        </ul>
        <div className="mt-6">
          <CTAButton href={tier.href} variant={tier.highlight ? "primary" : "secondary"}>{tier.cta}</CTAButton>
        </div>
      </div>
    );
  }
  