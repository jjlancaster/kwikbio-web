export const metadata = {
    title: "Terms of Service — kwiKBio",
    description: "Terms under which kwiKBio Inc. provides the FastScience! ARS service. Beta.",
  };

  export default function TermsPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Terms of Service</h1>
        <p className="text-sm text-slate-500">Effective 2026-05-26. The Service is in <strong>beta</strong>.</p>

        <h2>1. Acceptance</h2>
        <p>
          By creating an account or using the kwiKBio service ("the Service"), you agree
          to these Terms. If you do not agree, do not use the Service.
        </p>

        <h2>2. The Service</h2>
        <p>
          kwiKBio Inc. provides web-based access to the FastScience!™ v7 Automated
          Research System (ARS), a hypothesis-generation engine. The ARS framework is
          the subject of US Patent 11,282,088. The Service produces ranked experiment
          proposals from natural-language research questions.
        </p>

        <h2>3. Beta status — no SLA, no fitness warranty</h2>
        <p>
          The Service is beta-stage. We make no uptime, accuracy, or fitness-for-purpose
          guarantees outside of an executed Enterprise agreement. Features, pricing, and
          data retention may change with notice.
        </p>

        <h2>4. Provisional outputs and prohibited uses</h2>
        <p>
          All outputs are provisional. They are <strong>NOT</strong> medical advice, diagnostic
          results, legal advice, regulatory submissions, or substitutes for human peer
          review or experimental verification. You agree to validate any output before
          relying on it for any clinical, regulatory, commercial, or safety-critical
          decision. You agree <strong>not</strong> to submit Protected Health Information (PHI),
          regulated personal data, or any data prohibited under our <a href="/legal/privacy">Privacy Policy §2</a>.
        </p>

        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, mirror, or redistribute the knowledge graph without a written license.</li>
          <li>Use the Service to design weapons, mass surveillance, or content intended to harm.</li>
          <li>Submit data you do not have the right to submit.</li>
          <li>Attempt to extract proprietary PRISM-9 weights or reverse-engineer the QUBO pipeline.</li>
          <li>Resell access without a separate written agreement.</li>
        </ul>

        <h2>6. Billing</h2>
        <p>
          Paid tiers bill monthly via Stripe in advance. CRO matching (Pro and above)
          carries a transparent 6% commission collected from the matched CRO, not added
          to your invoice. You can cancel at any time; cancellation takes effect at the
          end of the current billing period. No refunds for partial months.
        </p>

        <h2>7. Intellectual property</h2>
        <p>
          You retain rights to your queries, your domain manuals, and your Studied System
          Knowledge Model (SSKM). kwiKBio Inc. retains rights to the Service software,
          the FastScience! methodology, the PRISM-9 / Cube-27 / QUBO pipeline
          implementation, and the ARS patent (US 11,282,088).
        </p>

        <h2>8. Liability</h2>
        <p>
          The Service is provided "as is" and "as available." To the maximum extent permitted
          by law, kwiKBio Inc. disclaims all warranties express or implied. We disclaim
          liability for indirect, consequential, incidental, or punitive damages. Aggregate
          liability in any 12-month period is capped at the greater of (a) the amount you
          paid us in that period, or (b) US $100.
        </p>

        <h2>9. Enterprise / DPA</h2>
        <p>
          Enterprise customers may negotiate a separate Data Processing Agreement and, where
          applicable, a Business Associate Agreement. Until such an agreement is countersigned,
          the freemium-tier prohibitions in §4 apply to all tiers.
        </p>

        <h2>10. Governing law</h2>
        <p>Delaware, USA. Disputes resolve in Wilmington courts.</p>

        <h2>11. Changes</h2>
        <p>
          We may update these Terms with 30 days' email notice. Continued use after the
          effective date constitutes acceptance.
        </p>

        <h2>12. Contact</h2>
        <p>legal@kwikbio.com — kwiKBio Inc., c/o HydroJoule LLC.</p>
      </section>
    );
  }
  