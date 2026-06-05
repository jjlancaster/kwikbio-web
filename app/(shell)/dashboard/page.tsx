export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">What are you working on today?</h1>
      <p className="mt-2 text-ink-secondary">
        Your research shell is ready. The ARS quick query, recent activity, and live Gateway
        workspace come online in the next phase.
      </p>

      <section className="mt-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/60">
          Your Gateways
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href="/g/kwikbio"
            className="rounded-lg border border-shell-border bg-shell-surface px-4 py-3 transition-colors hover:border-accent"
          >
            <div className="font-medium">kwiKBio 🔬</div>
            <div className="text-xs text-ink-secondary">Biomedical · Enter →</div>
          </a>
        </div>
      </section>
    </div>
  );
}
