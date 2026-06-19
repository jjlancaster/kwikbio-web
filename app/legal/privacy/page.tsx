export const metadata = {
    title: "Privacy Policy",
    description: "How kwiKBio Inc. collects, uses, and protects your data. Beta-stage research tool.",
  };

  export default function PrivacyPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Effective 2026-05-26. kwiKBio Inc. is a subsidiary of HydroJoule LLC. This Service is in <strong>beta</strong>; provisions may evolve with appropriate notice.</p>

        <h2>1. Scope and beta status</h2>
        <p>
          This Service is beta-stage research tooling. Availability, retention, and feature
          guarantees described below represent our current intent, not contractual SLAs.
          Enterprise customers may negotiate a separate Data Processing Agreement (DPA).
        </p>

        <h2>2. Data you must NOT submit</h2>
        <p>You agree not to submit, and we do not knowingly accept:</p>
        <ul>
          <li><strong>Protected Health Information (PHI)</strong> as defined under HIPAA. We are not a HIPAA-covered entity and we will not sign a BAA at the freemium, Explorer, Researcher, or Pro tiers.</li>
          <li>Personal data subject to GDPR Article 9 (special categories) unless covered by a separate Enterprise DPA.</li>
          <li>Data covered by FERPA, GLBA, or other sectoral regimes without prior written agreement.</li>
          <li>Classified, export-controlled (ITAR/EAR), or otherwise legally restricted material.</li>
        </ul>
        <p>If you submit such data inadvertently, contact <strong>privacy@kwikbio.com</strong> and we will purge it on a best-effort basis.</p>

        <h2>3. What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email, optional name, optional institutional affiliation.</li>
          <li><strong>Query content:</strong> the natural-language research questions you submit and the resulting Studied System Knowledge Model (SSKM) state. Scoped to your tenant by default.</li>
          <li><strong>Usage telemetry:</strong> page views, query counts, performance metrics — pseudonymized where reasonable.</li>
          <li><strong>Billing metadata:</strong> handled by Stripe; we store only the references Stripe returns (customer ID, last-four digits, invoice IDs).</li>
        </ul>

        <h2>4. How we use it</h2>
        <ul>
          <li>To run your ARS queries and persist your SSKM across sessions.</li>
          <li>To enforce your subscription tier limits.</li>
          <li>To improve product reliability via aggregate, pseudonymized telemetry.</li>
          <li>To contact you about your account, security, or material policy changes.</li>
        </ul>

        <h2>5. Tenant scoping and exceptions</h2>
        <p>
          Your query content and SSKM stay within your tenant boundary <strong>except</strong> as
          required to: (a) operate the Service (e.g., persistence, backups, disaster recovery);
          (b) respond to lawful process; (c) investigate security incidents or abuse; or
          (d) when you explicitly opt in to a shared model training program. We do not sell
          user data. We do not train shared models on tenant query content without explicit
          written consent.
        </p>

        <h2>6. Subprocessors</h2>
        <p>We use the following subprocessors. Material changes will be announced 30 days in advance for paying customers.</p>
        <ul>
          <li><strong>Hostinger</strong> — infrastructure hosting (current production region: EU).</li>
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>GitHub</strong> — source code and engineering audit trail.</li>
        </ul>

        <h2>7. Your rights</h2>
        <p>
          You can export your SSKM to RDF/Turtle at any time, request deletion of your
          account and associated data, and opt out of non-essential telemetry. Backup
          rotation means deletion is propagated within approximately 30 days. Email
          <strong>privacy@kwikbio.com</strong>.
        </p>

        <h2>8. Security</h2>
        <p>
          Data is encrypted in transit (TLS) and at rest for production databases and
          backups. We do not represent that any system is invulnerable; we will notify
          affected users of material confirmed breaches without undue delay.
        </p>

        <h2>9. Changes</h2>
        <p>
          We notify account holders by email at least 30 days before material changes
          take effect. Continued use after the effective date constitutes acceptance.
        </p>

        <h2>10. Contact</h2>
        <p>privacy@kwikbio.com — kwiKBio Inc., c/o HydroJoule LLC.</p>
      </section>
    );
  }
  