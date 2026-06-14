export const metadata = {
  title: "FS! Fellows — kwiKBio",
  description:
    "Free 90-day State B access in exchange for structured feedback. 10 spots. Applications open now.",
};

export default function FellowsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-600 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/20 text-white px-3 py-1 rounded-full mb-6">
            Founding Community
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            FS! Fellows — Be the first to run research on the ARS OS
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Free 90-day State B access in exchange for structured feedback.{" "}
            <strong>10 spots.</strong> Applications open now.
          </p>
          <a
            href="#apply"
            className="mt-8 inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-md hover:bg-slate-100 transition-colors"
          >
            Apply Now →
          </a>
        </div>
      </section>

      {/* What You Get */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you get</h2>
            <ul className="space-y-4">
              {[
                {
                  icon: "🔬",
                  title: "Access to the ARS Research OS (beta)",
                  desc: "Full State B access — PRISM-9 reduction, Cube-27 expansion, and QUBO path-planning on your actual research question.",
                },
                {
                  icon: "📡",
                  title: "Direct line to the team",
                  desc: "A dedicated Slack channel with Justin and the core team. Your feedback shapes v7.",
                },
                {
                  icon: "🧪",
                  title: "Your research question gets run on the system",
                  desc: "We'll process your hardest open question and return a ranked set of experiment proposals.",
                },
                {
                  icon: "🏅",
                  title: "Your name in the Fellows credits",
                  desc: "Founding Fellows are credited in the product, launch materials, and press.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What we need from you</h2>
            <ul className="space-y-4">
              {[
                {
                  icon: "🎓",
                  title: "Name + institution",
                  desc: "We're looking for working researchers — academic, industry, or independent.",
                },
                {
                  icon: "🔭",
                  title: "Research domain",
                  desc: "e.g. oncology, quantum biology, materials science, climate systems. Any domain that benefits from causal graph reasoning.",
                },
                {
                  icon: "💭",
                  title: "Your hardest open research question",
                  desc: "The one that keeps you up at night. The ARS is built for exactly those problems.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>10 spots total.</strong> Fellows are selected on research domain diversity and
                the depth of their open question. We'll respond within 5 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Apply to be an FS! Fellow</h2>
          <p className="text-center text-slate-600 mb-10">
            Takes about 5 minutes. We read every application personally.
          </p>

          <form
            method="POST"
            action="/api/fellows"
            className="space-y-6 bg-white border border-slate-200 rounded-xl p-8 shadow-sm"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full name <span className="text-brand-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Dr. Jane Doe"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-brand-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@university.edu"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-slate-700 mb-1">
                Institution / affiliation <span className="text-brand-600">*</span>
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                required
                placeholder="MIT, independent, startup, etc."
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="research_domain" className="block text-sm font-medium text-slate-700 mb-1">
                Research domain <span className="text-brand-600">*</span>
              </label>
              <input
                id="research_domain"
                name="research_domain"
                type="text"
                required
                placeholder="e.g. oncology, quantum biology, materials science…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="open_question" className="block text-sm font-medium text-slate-700 mb-1">
                Your hardest open research question <span className="text-brand-600">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                The one that keeps you up at night. Be specific — this is what the ARS will actually run.
              </p>
              <textarea
                id="open_question"
                name="open_question"
                required
                rows={5}
                placeholder="What is the causal mechanism by which…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-y"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Submit Application →
            </button>

            <p className="text-center text-xs text-slate-500">
              By applying you agree to structured feedback sessions (≈2 hrs/month) in exchange for your free access.
            </p>
          </form>
        </div>
      </section>

      {/* Footer note */}
      <section className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-700">US Patent 11,282,088</strong> — The moat is real. The fellows are the proof of concept.
        </p>
      </section>
    </>
  );
}
