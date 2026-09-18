export const metadata = {
    title: "Terms of Use — kwiKBio",
    description: "Terms under which kwiKBio Inc. provides the FastScience! ARS service, the public knowledge database, and related tiers. Beta.",
  };

  export default function TermsPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Terms of Use</h1>
        <p className="text-sm text-slate-500">
          Effective 2026-08-21. Supersedes the Terms of Service dated 2026-05-26.
          The Service is in <strong>beta</strong>. <em>(These Terms of Use are also
          referred to as the Terms of Service; the two names mean the same document.)</em>
        </p>
        <p className="text-sm italic text-slate-500">
          DRAFT pending legal review. Sections 2, 5, 6, 7 and 16 are new and have not
          yet been reviewed by counsel.
        </p>

        <h2>1. Acceptance</h2>
        <p>
          By using the kwiKBio service ("the Service") — including anonymous use of the
          public knowledge search — you agree to these Terms. If you do not agree, do not
          use the Service. Where the Service presents these Terms for acknowledgement,
          continuing past that acknowledgement constitutes acceptance.
        </p>

        <h2>2. Eligibility and age</h2>
        <p>
          Certain features require you to be <strong>18 years of age or older</strong>.
        </p>
        <ul>
          <li>
            <strong>Under 18.</strong> Minors may use the free (Freemium) knowledge search,
            but <strong>cannot enter into a subscription contract</strong>. Minors lack
            capacity to contract, so any paid access for a minor must be authorized and
            held by an adult: a <strong>parent or legal guardian</strong>, or an
            <strong> educational institution</strong> (classroom or school account). The
            authorizing adult or institution is the contracting party and the payer.
          </li>
          <li>
            <strong>SciCrush is 18+ only.</strong> See Section 7.
          </li>
        </ul>
        <p>
          You agree that the age information you provide is accurate. We may suspend access
          where we reasonably believe an age or authorization requirement has not been met.
        </p>

        <h2>3. The Service</h2>
        <p>
          kwiKBio Inc. provides web-based access to the FastScience!™ v7 Automated
          Research System (ARS), a hypothesis-generation engine. The ARS framework is
          the subject of US Patent 11,282,088. The Service produces ranked experiment
          proposals from natural-language research questions.
        </p>

        <h2>4. The public knowledge database</h2>
        <p>
          These Terms govern your access to and use of the <strong>public knowledge
          database</strong> (the public knowledge graph, its nodes, edges, provenance
          records, and derived artifacts), <strong>including any databases or data
          resources operated under or linked through HydroJoule LLC</strong> that are made
          available to you as part of your subscription or through the
          <strong> Freemium bridge</strong>. Access to those linked resources is provided
          under these Terms and any additional terms that accompany the specific resource.
        </p>
        <p>
          The public knowledge database is a shared research commons. Access is a licence
          to use, not a transfer of ownership, and is subject to Section 10 (acceptable use)
          — in particular the prohibition on bulk scraping, mirroring, or redistribution
          without a written licence.
        </p>

        <h2>5. Contributions and intellectual property, by tier</h2>
        <p>
          What happens to knowledge you generate through the Service depends on your tier.
          Read this section carefully — it determines whether your results become part of
          the public commons.
        </p>

        <h3>5.1 Freemium — contributions yield to the public database</h3>
        <p>
          If you use the Service on the free (Freemium) tier, you <strong>grant kwiKBio Inc.
          the right to incorporate the knowledge, assertions, relationships, and derived
          results generated from your use into the public knowledge database</strong>, where
          they become part of the public research commons available to all users. In plain
          terms: <strong>Freemium yields its intellectual property to the public
          database.</strong> Freemium is offered on this basis; if you do not want your
          results contributed to the commons, do not use the Freemium tier for that work.
        </p>

        <h3>5.2 Subscribers — yield to the public database, with a private POD exception</h3>
        <p>
          Paid individual subscribers likewise contribute generated knowledge to the public
          database by default, <strong>except</strong> that a subscriber may create a
          <strong> Private Repository in their own Inrupt / Solid POD space</strong>. A
          Private Repository <strong>"untangles"</strong> from the public graph: from the
          point of untangling forward, results generated within that Private Repository
          <strong> update only the private version</strong> and are not written back to the
          public knowledge database.
        </p>
        <p>
          Untangling is forward-looking only. Knowledge already contributed to the public
          database before untangling remains in the public commons. You control and are
          responsible for your POD and its contents; kwiKBio does not claim ownership of the
          contents of your Private Repository.
        </p>

        <h3>5.3 Enterprise — private models and private deployment</h3>
        <p>
          Enterprise agreements may provide for the <strong>entire ARS to run against private
          data models</strong> — including a customer-supplied or customer-dedicated large
          language model (LLM) — such that no customer knowledge is contributed to the public
          database. Enterprise terms, including any deviation from Sections 5.1 and 5.2, are
          set out in the executed Enterprise agreement, which controls over this Section in
          the event of conflict.
        </p>

        <h2>6. IP develop-forward sequence</h2>
        <p>
          The Service implements an <strong>IP develop-forward sequence</strong> as an element
          of the ARS: knowledge entering the system is advanced through successive stages of
          development — hypothesis, experiment proposal, result, and validated assertion —
          with provenance retained at each stage, so that the resulting intellectual property
          can be traced forward from its contributing inputs. This sequence is part of the
          patented ARS framework (US Patent 11,282,088).
        </p>
        <p>
          Attribution, credit, and any downstream rights arising from knowledge advanced
          through this sequence are determined by the tier under which the contribution was
          made (Section 5) and by any separate written agreement.
        </p>

        <h2>7. SciCrush — adults 18 and over only</h2>
        <p>
          SciCrush social and dating features are available <strong>only to adults aged 18 or
          older</strong>. This restriction is <strong>unconditional</strong>: it applies even
          where a minor has been granted research access under a parental or classroom
          authorization pursuant to Section 2. Minors must not access, and must not attempt
          to access, SciCrush.
        </p>

        <h2>8. Beta status — no SLA, no fitness warranty</h2>
        <p>
          The Service is beta-stage. We make no uptime, accuracy, or fitness-for-purpose
          guarantees outside of an executed Enterprise agreement. Features, pricing, and
          data retention may change with notice.
        </p>

        <h2>9. Provisional outputs and prohibited uses</h2>
        <p>
          All outputs are provisional. They are <strong>NOT</strong> medical advice, diagnostic
          results, legal advice, regulatory submissions, or substitutes for human peer
          review or experimental verification. You agree to validate any output before
          relying on it for any clinical, regulatory, commercial, or safety-critical
          decision. You agree <strong>not</strong> to submit Protected Health Information (PHI),
          regulated personal data, or any data prohibited under our <a href="/legal/privacy">Privacy Policy §2</a>.
        </p>

        <h2>10. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, mirror, or redistribute the knowledge graph or the public knowledge database without a written license.</li>
          <li>Use the Service to design weapons, mass surveillance, or content intended to harm.</li>
          <li>Submit data you do not have the right to submit.</li>
          <li>Attempt to extract proprietary PRISM-9 weights or reverse-engineer the QUBO pipeline.</li>
          <li>Resell access without a separate written agreement.</li>
          <li>Circumvent, or attempt to circumvent, the age and eligibility controls in Sections 2 and 7.</li>
        </ul>

        <h2>11. Billing</h2>
        <p>
          Paid tiers bill monthly via Stripe in advance. CRO matching (Pro and above)
          carries a transparent 6% commission collected from the matched CRO, not added
          to your invoice. You can cancel at any time; cancellation takes effect at the
          end of the current billing period. No refunds for partial months. Subscriptions
          may only be purchased by a person with capacity to contract (Section 2).
        </p>

        <h2>12. Intellectual property in the platform</h2>
        <p>
          Subject to Section 5, you retain rights to your queries, your domain manuals, and
          your Studied System Knowledge Model (SSKM). kwiKBio Inc. retains rights to the
          Service software, the FastScience! methodology, the PRISM-9 / Cube-27 / QUBO
          pipeline implementation, and the ARS patent (US 11,282,088).
        </p>

        <h2>13. Liability</h2>
        <p>
          The Service is provided "as is" and "as available." To the maximum extent permitted
          by law, kwiKBio Inc. disclaims all warranties express or implied. We disclaim
          liability for indirect, consequential, incidental, or punitive damages. Aggregate
          liability in any 12-month period is capped at the greater of (a) the amount you
          paid us in that period, or (b) US $100.
        </p>

        <h2>14. Enterprise / DPA</h2>
        <p>
          Enterprise customers may negotiate a separate Data Processing Agreement and, where
          applicable, a Business Associate Agreement. Until such an agreement is countersigned,
          the freemium-tier prohibitions in Section 9 apply to all tiers.
        </p>

        <h2>15. Governing law and venue</h2>
        <p>
          These Terms are governed by the laws of the <strong>State of Vermont, USA</strong>,
          without regard to its conflict-of-laws rules. The exclusive jurisdiction and venue
          for any dispute arising out of or relating to these Terms or the Service is the
          state and federal courts located in <strong>Vermont</strong>, and you consent to the
          personal jurisdiction of those courts.
        </p>

        <h2>16. Age verification and consent records</h2>
        <p className="text-sm italic text-slate-500">
          [Placeholder pending legal review — the age-verification mechanism, the treatment
          of children under 13 (COPPA), the accepted form of verifiable parental consent,
          and consent record retention and revocation are to be specified by counsel.]
        </p>

        <h2>17. Changes</h2>
        <p>
          We may update these Terms with 30 days&rsquo; email notice. Material changes will
          be presented for re-acknowledgement. Continued use after the effective date
          constitutes acceptance.
        </p>

        <h2>18. Contact</h2>
        <p>legal@kwikbio.com — kwiKBio Inc., c/o HydroJoule LLC.</p>
      </section>
    );
  }
