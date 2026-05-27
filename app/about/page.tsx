export const metadata = {
    title: "About kwiKBio — FastScience! Methodology",
    description: "The 33-year story of FastScience! and the ARS engine behind kwiKBio.",
  };

  export default function AboutPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>What is kwiKBio?</h1>
        <p className="lead">
          kwiKBio is the web entry point to the <strong>FastScience!™ v7</strong> research engine —
          a 33-year-old methodology, freshly accelerated by graph AI and quantum solvers.
        </p>

        <h2>The pipeline</h2>
        <p>Every ARS query traverses the same seven-stage loop:</p>
        <ol>
          <li><strong>Question</strong> — drop your research goal into the Gateway, freeform.</li>
          <li><strong>Domain Manual</strong> — your field's canonical knowledge is loaded as RDF/Turtle. SHACL validates the graph schema.</li>
          <li><strong>Knowledge Graph</strong> — entities and causal arcs land in Neo4j. Steeg SLAM (Sub-Linear Association Mining) discovers higher-order k-tuple correlations.</li>
          <li><strong>PRISM-9</strong> — the system reduces your problem to ≤9 dominant factors. No more, no less.</li>
          <li><strong>Cube-27</strong> — fractal 3×3×3 expansion of those 9 nodes into 27 sub-factors. The geometry preserves causal locality.</li>
          <li><strong>QUBO Solve</strong> — the path-planning problem becomes a Quadratic Unconstrained Binary Optimization, solved on quantum-annealing hardware where available, classical fallback otherwise.</li>
          <li><strong>Experiment</strong> — the ARS engine emits ranked, runnable experiment proposals routed to matched CROs through ExpChooser.</li>
        </ol>

        <h2>Version history — 33 years of FastScience!</h2>
        <ul>
          <li><strong>v1 (1993):</strong> FastScience! method designed — the Mod-Mon couple.</li>
          <li><strong>v2 (1994):</strong> IM3, citizen-science crowdsourcing, reverse-engineered causal flow dynamics.</li>
          <li><strong>v3 (2001):</strong> 3D-GEMS multi-dimensional real-world modeling.</li>
          <li><strong>v4 (2007–9):</strong> AIM3 proposed at Vrije Universiteit; energy-system modeling.</li>
          <li><strong>v5 (2018–22):</strong> Semantic Web, Watson NLP, KOTF, AIM4IT HD.</li>
          <li><strong>v6:</strong> Deep learning, reinforcement learning, RDF, Neo4j as causal backbone.</li>
          <li><strong>v7 (Q1 2026):</strong> Quantum solving for NP-hard QUBO problems. ← current</li>
        </ul>

        <h2>Trust signals</h2>
        <ul>
          <li><strong>US Patent 11,282,088</strong> — Automated Research System (ARS), J. Lancaster. Priority 2007-01-22, granted, in force.</li>
          <li>Built atop the academic prior art of <strong>Steeg SLAM</strong> (Sub-Linear Association Mining; US 6,493,637, expired) — explicitly cited in the ARS patent family.</li>
          <li><strong>HydroJoule LLC</strong> parent — kwiKBio Inc., Climate Research Inc., Vermont Medical College, LOOJL.</li>
          <li>Production infrastructure: dual-VPS Hostinger deployment with PostgreSQL, Neo4j, and PM2 process supervision.</li>
        </ul>

        <h2>Who's behind this</h2>
        <p>
          kwiKBio is built by a small mesh of human and AI agents coordinating under
          HydroJoule LLC. Justin Lancaster (founder, patent author) leads product and science.
          The agent mesh — Hydro, Joule, Watt, Lumen, Photon, and others — handles
          infrastructure, builds, and continuous integration. We work in the open: every
          decision is logged, every commit is signed, and every user query stays in
          your tenant.
        </p>

        <h2>The honest disclaimer</h2>
        <p>
          FastScience! accelerates hypothesis generation. It does not replace experimental
          verification, peer review, or your judgment. Outputs are provisional and require
          human validation before any clinical or regulatory use.
        </p>
      </section>
    );
  }
  