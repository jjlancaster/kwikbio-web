export const metadata = {
    title: "About — FastScience! Methodology",
    description: "The FastScience! methodology and the ARS engine behind kwiKBio.",
  };

  export default function AboutPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>What is kwiKBio?</h1>
        <p className="lead">
          kwiKBio is the web entry point to the <strong>FastScience!™ v7</strong> research engine —
          a methodology refined over decades, now accelerated by graph AI and quantum-class solvers.
        </p>

        <h2>The pipeline</h2>
        <p>Every ARS query traverses the same seven-stage loop:</p>
        <ol>
          <li><strong>Question</strong> — drop your research goal into the Gateway, freeform.</li>
          <li><strong>Domain Manual</strong> — your field's canonical knowledge is loaded as RDF/Turtle. SHACL validates the graph schema.</li>
          <li><strong>Knowledge Graph</strong> — entities and causal arcs land in Neo4j. Sub-linear association mining surfaces candidate higher-order correlations.</li>
          <li><strong>PRISM-9</strong> — the system reduces your problem to ≤9 dominant factors.</li>
          <li><strong>Cube-27</strong> — fractal 3×3×3 expansion of those 9 nodes into 27 sub-factors. The geometry preserves causal locality.</li>
          <li><strong>QUBO Solve</strong> — the path-planning problem is reformulated as a Quadratic Unconstrained Binary Optimization. Quantum annealing is used where available; classical simulated annealing serves as fallback.</li>
          <li><strong>Experiment</strong> — the ARS engine emits ranked, runnable experiment proposals; Pro and above route them to matched CROs through ExpChooser.</li>
        </ol>

        <h2>Version history — FastScience!</h2>
        <p>FastScience! is the name of an evolving research methodology developed by the founder over multiple decades. Major iterations have introduced new modeling techniques as the supporting technology stack matured:</p>
        <ul>
          <li><strong>Early versions:</strong> the original Mod-Mon couple, citizen-science crowdsourcing, and reverse-engineered causal flow dynamics.</li>
          <li><strong>Mid-period versions:</strong> multi-dimensional real-world modeling and energy-system applications.</li>
          <li><strong>Recent versions:</strong> Semantic Web ingestion, RDF/Neo4j as a causal backbone, deep-learning summarization in the loop.</li>
          <li><strong>v7 (2026):</strong> QUBO formulation and quantum-annealing acceleration. ← current</li>
        </ul>
        <p className="text-sm text-slate-500"><em>Detailed version history and references available on request.</em></p>

        <h2>Trust signals</h2>
        <ul>
          <li><strong>US Patent 11,282,088</strong> — "Business methods and systems for offering and obtaining research services" (Automated Research System / ARS), inventor J. Lancaster. Priority date 2007-01-22.</li>
          <li>The ARS pipeline draws on a long line of academic prior art in sub-linear association mining and graph-based causal discovery.</li>
          <li><strong>HydroJoule LLC</strong> parent — kwiKBio Inc., Climate Research Inc., Vermont Medical College, LOOJL.</li>
          <li>Production infrastructure: dual-VPS Hostinger deployment with PostgreSQL, Neo4j, and PM2 process supervision.</li>
        </ul>

        <h2>Who's behind this</h2>
        <p>
          kwiKBio is built by a small mesh of human and AI agents coordinating under
          HydroJoule LLC. Justin Lancaster (founder, ARS patent author) leads product and science.
          An agent mesh handles infrastructure, builds, and continuous integration. We
          work transparently: decisions are logged, commits are signed, and your query
          data stays in your tenant boundary — see <a href="/legal/privacy">Privacy</a> for exact controls and carve-outs.
        </p>

        <h2>Beta status and honest disclaimer</h2>
        <p>
          kwiKBio is a <strong>beta-stage research tool</strong>. FastScience! accelerates
          hypothesis generation and experiment ranking. It does <strong>not</strong> replace experimental
          verification, peer review, regulatory submissions, or your own judgment. Outputs
          are provisional and require human validation before any clinical, regulatory,
          commercial, or safety-critical use. Do not upload Protected Health Information
          (PHI) or other regulated personal data — see <a href="/legal/terms">Terms §4</a>.
        </p>
      </section>
    );
  }
  