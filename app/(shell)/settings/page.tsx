import Link from "next/link";
import { getSession } from "@/lib/session";

export const metadata = { title: "Settings — kwiKBio" };

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="mt-6 rounded-lg border border-shell-border bg-shell-surface p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary/60">
          Account
        </div>
        <div className="mt-2 text-sm text-ink-primary">
          {session?.email ?? "Signed in"}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-shell-border bg-shell-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-ink-primary">SciCrush profile</div>
            <p className="mt-1 text-sm text-ink-secondary">
              Tell the engine about your research passion so it can tune matches.
            </p>
          </div>
          <Link
            href="/settings/profile"
            className="shrink-0 rounded-md border border-shell-border px-4 py-2 text-sm text-ink-primary transition-colors hover:border-accent"
          >
            Edit →
          </Link>
        </div>
      </section>
    </div>
  );
}
