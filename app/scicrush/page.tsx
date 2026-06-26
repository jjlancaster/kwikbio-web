import Link from "next/link";
import Nav from "@/components/Nav";

const TIERS = [
  {
    name: "Explorer", price: "$0", period: "",
    features: ["1 hypothesis/month", "Public ARS queries", "SciCrush community access", "Spectator science feed"],
    cta: "Start Free", href: "/pricing", highlight: false,
  },
  {
    name: "Contributor", price: "$8", period: "/mo",
    features: ["10 hypotheses/month", "Full ARS Gateway", "LOPE experiment browser", "Citizen subject cohort enroll", "Discover Kit eligible"],
    cta: "Get Contributor", href: "/pricing?tier=contributor", highlight: false,
  },
  {
    name: "Fellow", price: "$20", period: "/mo",
    features: ["Unlimited hypotheses", "SLAM + VOI pipeline", "CRO marketplace", "DAE results analysis", "Monthly Discover Kit", "Priority hypothesis queue"],
    cta: "Become a Fellow", href: "/pricing?tier=fellow", highlight: true,
  },
];

const STEPS = [
  { n: "01", title: "Watch",   desc: "Follow live ARS experiments. See hypotheses form, VOI scores update, LOPE experiments launch." },
  { n: "02", title: "Enroll",  desc: "Join cohorts as a Citizen Subject. Contribute surveys, sensor data, or wearable streams." },
  { n: "03", title: "Discover",desc: "Get your monthly Discover Kit — hands-on experiments run at home, results feed the live graph." },
  { n: "04", title: "Publish", desc: "Citizen contributors are credited in findings. Your data becomes part of the public knowledge graph." },
];

const KITS = [
  { tier: "Seed",   price: "$29/mo", desc: "Beginner, 2 experiments" },
  { tier: "Sprout", price: "$49/mo", desc: "Intermediate, 4 experiments + data upload" },
  { tier: "Root",   price: "$89/mo", desc: "Advanced, 6 experiments + cohort credit" },
  { tier: "Branch", price: "$199/mo",desc: "Full researcher kit + SciCrush Fellow" },
];

export default function SciCrushPage() {
  return (
    <div className="min-h-screen bg-bio-navy text-slate-200">
      <Nav />

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-bio-teal mb-4">Citizen Science Platform</span>
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          You belong in<br /><span className="text-bio-gold">the laboratory.</span>
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          SciCrush turns curious minds into active researchers. Enroll in real cohorts, watch experiments run live,
          and contribute to discoveries powered by the ARS-FS!4 engine.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/pricing"
            className="px-8 py-3 bg-bio-teal text-bio-navy font-bold rounded-lg hover:opacity-90 text-sm">
            Join Free
          </Link>
          <Link href="/research"
            className="px-8 py-3 border border-bio-gold text-bio-gold rounded-lg hover:bg-bio-gold/10 text-sm">
            Try the Research Pipeline
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-bio-navy/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-bio-gold text-center mb-12">Spectator Science → Citizen Scientist</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-bio-purple/30 border border-bio-purple flex items-center justify-center mx-auto mb-4">
                  <span className="text-bio-gold font-bold text-sm">{s.n}</span>
                </div>
                <h3 className="font-bold text-slate-200 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Kit */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-bio-gold mb-3">Discover Kit</h2>
          <p className="text-slate-400 mb-8">Monthly subscription box. Real experiments. Real data. Real contributions to live studies.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KITS.map((k) => (
              <div key={k.tier}
                className="p-4 rounded-lg border border-slate-700 bg-bio-navy/30 hover:border-bio-teal/50 transition-colors">
                <h3 className="font-bold text-slate-200 mb-1">{k.tier}</h3>
                <p className="text-bio-gold font-mono text-sm mb-2">{k.price}</p>
                <p className="text-xs text-slate-500">{k.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-bio-navy/60">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-bio-gold text-center mb-10">SciCrush Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((t) => (
              <div key={t.name}
                className={`p-6 rounded-xl border ${
                  t.highlight ? "border-bio-gold bg-bio-gold/5" : "border-slate-700 bg-bio-navy/30"
                }`}>
                {t.highlight && (
                  <span className="inline-block text-xs font-bold text-bio-navy bg-bio-gold px-2 py-0.5 rounded mb-3">Most Popular</span>
                )}
                <h3 className="text-xl font-bold text-slate-200 mb-1">{t.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-bio-gold">{t.price}</span>
                  {t.period && <span className="text-slate-500 text-sm mb-1">{t.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-bio-teal mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={t.href}
                  className={`block text-center py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ${
                    t.highlight ? "bg-bio-gold text-bio-navy" : "bg-bio-purple text-white"
                  }`}>
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Science needs more eyes.</h2>
        <p className="text-slate-400 mb-8">Join citizen scientists advancing real research through the ARS-FS!4 platform.</p>
        <Link href="/pricing"
          className="px-10 py-4 bg-bio-teal text-bio-navy font-bold rounded-xl text-lg hover:opacity-90">
          Join SciCrush Today
        </Link>
      </section>
    </div>
  );
}
