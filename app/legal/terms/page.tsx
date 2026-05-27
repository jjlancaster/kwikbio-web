export const metadata = {
    title: "Terms of Service — kwiKBio",
    description: "Terms under which kwiKBio Inc. provides the FastScience! ARS service.",
  };

  export default function TermsPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Terms of Service</h1>
        <p className="text-sm text-slate-500">Effective 2026-05-26.</p>

        <h2>1. Acceptance</h2>
        <p>
          By creating an account or using the kwiKBio service ("the Service"), you agree
          to these Terms. If you do not agree, do not use the Service.
        </p>

        <h2>2. The Service</h2>
        <p>
          kwiKBio Inc. provides web-based access to the FastScience!™ v7 Automated
          Research System (ARS), a hypothesis-generation engine covered by US Patent
          11,282,088. The Service produces ranked experiment proposals from
          natural-language research questions.
        </p>

        <h2>3. Research outputs are provisional</h2>
        <p>
          All outputs of the Service are provisional. They are NOT medical advice, legal
          advice, regulatory submissions, or substitutes for human peer review or
          experimental verification. You agree to validate any output before relying on it
          for any clinical, regulatory, commercial, or safety-critical decision.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, mirror, or redistribute the knowledge graph without written license.</li>
          <li>Use the Service to design weapons, surveillance tools, or anything intended to harm.</li>
          <li>Submit data you do not have the right to submit.</li>
          <li>Attempt to extract proprietary PRISM-9 weights or reverse-engineer the QUBO solver.</li>
        </ul>

        <h2>5. Billing</h2>
        <p>
          Paid tiers bill monthly via Stripe in advance. CRO matching (Pro and above)
          carries a transparent 6% commission collected from the CRO, not added to your
          invoice. You can cancel at any time; cancellation takes effect at the end of
          the current billing period. No refunds for partial months.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          You retain all rights to your queries, your domain manuals, and your
          Studied System Knowledge Model (SSKM). kwiKBio Inc. retains all rights to the
          Service software, the FastScience! methodology, the PRISM-9 / Cube-27 / QUBO
          pipeline, and the underlying ARS patent (US 11,282,088).
        </p>

        <h2>7. Liability</h2>
        <p>
          The Service is provided "as is." To the maximum extent permitted by law,
          kwiKBio Inc. disclaims liability for indirect, consequential, or incidental
          damages. Total liability in any 12-month period is capped at the amount you
          paid us in that period.
        </p>

        <h2>8. Governing law</h2>
        <p>Delaware, USA. Disputes resolve in Wilmington courts.</p>

        <h2>9. Changes</h2>
        <p>
          We may update these Terms with 30 days' notice by email. Continued use after
          the effective date constitutes acceptance.
        </p>

        <h2>10. Contact</h2>
        <p>legal@kwikbio.com — kwiKBio Inc., c/o HydroJoule LLC.</p>
      </section>
    );
  }
  