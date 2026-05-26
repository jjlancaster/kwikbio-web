import CTAButton from "./CTAButton";
  import TrustBar from "./TrustBar";

  export default function Hero() {
    return (
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
          The Fastest Path from <span className="text-brand-700">Research Question</span> to Breakthrough
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          kwiKBio compresses years of literature mining, experiment design, and CRO selection into hours —
          powered by the FastScience!™ v7 engine and the ARS Automated Research System.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <CTAButton href="/pricing" variant="primary">Start Free</CTAButton>
          <CTAButton href="/about" variant="secondary">See How It Works</CTAButton>
          <CTAButton href="/gateway" variant="ghost">Join Beta</CTAButton>
        </div>
        <div className="mt-10">
          <TrustBar />
        </div>
      </section>
    );
  }
  