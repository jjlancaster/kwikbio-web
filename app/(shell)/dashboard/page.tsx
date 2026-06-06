import Link from "next/link";
import { getSession } from "@/lib/session";

export const metadata = { title: "Dashboard — kwiKBio" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const name = session?.name ?? "researcher";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">
        {greeting()}, {name}.{" "}
        <span className="text-ink-secondary">What are you working on today?</span>
      </h1>

      {/* Quick query — links into the full Gateway workspace */}
      <Link
        href="/g/kwikbio"
        className="mt-6 flex items-center justify-between rounded-xl border border-shell-border bg-shell-surface px-5 py-4 transition-colors hover:border-accent"
      >
        <span className="font-mono text-sm text-ink-secondary">
          Ask the ARS engine a research question…
        </span>
        <span className="text-accent" aria-hidden>
          →
        </span>
      </Link>

      {/* Gateways */}
      <Section title="Your Gateways">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/g/kwikbio"
            className="min-w-[14rem] rounded-lg border border-shell-border bg-shell-surface px-4 py-3 transition-colors hover:border-accent"
          >
            <div className="font-medium">kwiKBio 🔬</div>
            <div className="text-xs text-ink-secondary">
              Biomedical · Enter →
            </div>
          </Link>
          <div className="flex min-w-[14rem] items-center rounded-lg border border-dashed border-shell-border px-4 py-3 text-sm text-ink-secondary/60">
            + Explore more Gateways (coming soon)
          </div>
        </div>
      </Section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Section title="Recent activity">
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>
              <span className="text-ink-primary">&ldquo;Biofilm query&rdquo;</span>{" "}
              — 3 hypotheses ranked{" "}
              <span className="text-ink-secondary/50">· 2h ago</span>
            </li>
            <li>
              FS! Foundations: Week 2 complete{" "}
              <span className="text-vertical-climate">✓</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink-secondary/50">
            Activity syncs from your SSKM once the Gateway is live on Jewel.
          </p>
        </Section>

        <Section title="Upcoming">
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>FS! Foundations — Week 3 opens Friday</li>
          </ul>
          <Link
            href="/courses"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Go to courses →
          </Link>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-secondary/60">
        {title}
      </div>
      {children}
    </section>
  );
}
