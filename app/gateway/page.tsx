export const metadata = { title: "Gateway — kwiKBio" };

  export default function GatewayPage() {
    const branches = [
      { k: "drug",     t: "Drug discovery",  d: "Target identification, hit-to-lead, mechanism-of-action queries." },
      { k: "climate",  t: "Climate",         d: "Bioenergy, carbon cycling, microbial consortia modeling." },
      { k: "bioenergy",t: "Bioenergy",       d: "Microbial consortia + metabolic pathway optimization (PRISM-9)." },
      { k: "custom",   t: "Custom research", d: "Bring your own domain manual; ARS will scope it." },
    ];
    return (
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold">Gateway</h1>
        <p className="text-slate-600 mt-3">What are you trying to solve?</p>
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {branches.map(b => (
            <button key={b.k} className="text-left border border-slate-200 rounded-lg p-6 hover:border-brand-600 transition">
              <div className="font-semibold">{b.t}</div>
              <p className="text-sm text-slate-600 mt-2">{b.d}</p>
            </button>
          ))}
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold">Try a sample ARS query</h2>
          <textarea
            className="mt-4 w-full border border-slate-300 rounded-md p-3 text-sm"
            rows={4}
            placeholder="e.g. Which microbial consortia maximize methane yield from agricultural waste?"
          />
          <button className="mt-3 bg-brand-600 text-white px-5 py-2 rounded-md hover:bg-brand-700">
            Run PRISM-9
          </button>
          <p className="text-xs text-slate-500 mt-2">Demo wiring lands Day 3 — see V2 spec.</p>
        </div>
      </section>
    );
  }
  