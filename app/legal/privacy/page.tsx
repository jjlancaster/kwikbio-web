export const metadata = {
    title: "Privacy Policy — kwiKBio",
    description: "How kwiKBio Inc. collects, uses, and protects your data.",
  };

  export default function PrivacyPage() {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Effective 2026-05-26. Operated by kwiKBio Inc., a Delaware corporation and subsidiary of HydroJoule LLC.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email, optional name, optional institutional affiliation.</li>
          <li><strong>Query content:</strong> the natural-language research questions you submit and the resulting Studied System Knowledge Model (SSKM) state. Scoped to your tenant. Not shared.</li>
          <li><strong>Usage telemetry:</strong> page views, query counts, performance metrics — pseudonymized.</li>
          <li><strong>Billing metadata:</strong> last-four card digits, billing address, invoice history — handled by Stripe, never stored on our servers.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To run your ARS queries and persist your SSKM across sessions.</li>
          <li>To enforce your subscription tier limits.</li>
          <li>To improve product reliability (aggregate, pseudonymized telemetry only).</li>
          <li>To contact you about your account, security, or material policy changes.</li>
        </ul>

        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell user data.</li>
          <li>We do not train shared models on tenant query content without explicit written consent.</li>
          <li>We do not share PII with third parties except payment processors (Stripe) and infrastructure providers (Hostinger).</li>
          <li>We do not run third-party ad trackers.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can export your SSKM to RDF/Turtle at any time, request deletion of your
          account and all associated data within 30 days, and opt out of all non-essential
          telemetry. Email <strong>privacy@kwikbio.com</strong>.
        </p>

        <h2>Data location</h2>
        <p>
          Production data is stored in PostgreSQL on Hostinger infrastructure (currently EU
          region). Backups are encrypted at rest and rotate every 7 days.
        </p>

        <h2>Changes</h2>
        <p>
          We notify all account holders by email at least 30 days before material changes
          to this policy take effect.
        </p>

        <h2>Contact</h2>
        <p>privacy@kwikbio.com — kwiKBio Inc., c/o HydroJoule LLC.</p>
      </section>
    );
  }
  