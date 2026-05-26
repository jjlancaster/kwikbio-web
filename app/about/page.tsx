export const metadata = { title: "About kwiKBio — FastScience! Methodology" };

  export default function AboutPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>What is kwiKBio?</h1>
        <p>
          kwiKBio is the web entry point to the <strong>FastScience!™ v7</strong> research engine —
          a 30-year-old methodology, freshly accelerated by graph AI and quantum solvers.
        </p>
        <h2>The pipeline</h2>
        <ol>
          <li><strong>Question</strong> — drop your research goal into the Gateway.</li>
          <li><strong>Domain Manual</strong> — your field's canonical knowledge is loaded as RDF/Turtle.</li>
          <li><strong>Graph</strong> — entities and causal arcs land in Neo4j.</li>
          <li><strong>PRISM-9</strong> — the system reduces your problem to ≤9 dominant factors.</li>
          <li><strong>Cube-27</strong> — fractal 3×3×3 expansion of those 9 nodes into 27 sub-factors.</li>
          <li><strong>QUBO Solve</strong> — quantum annealing finds the most coherent causal path.</li>
          <li><strong>Experiment</strong> — the ARS engine proposes ranked, runnable experiments.</li>
        </ol>
        <h2>Trust signals</h2>
        <ul>
          <li>US Patent 11,282,088 — Automated Research System (ARS), J. Lancaster</li>
          <li>Built on Steeg SLAM (Sub-Linear Association Mining) prior art</li>
          <li>HydroJoule LLC — kwiKBio Inc., Climate Research Inc., Vermont Medical College</li>
        </ul>
      </section>
    );
  }
  