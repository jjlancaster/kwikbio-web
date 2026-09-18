import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  maxLevelFor,
  maySelfPurchase,
  TIER_MAX_LEVEL,
} from "@/lib/auth/entitlement";
import { queryOne } from "@/lib/db/pg";
import { LevelSymbol, LEVEL_META } from "@/components/LevelSymbol";

export const metadata: Metadata = { title: "Your account" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  // Middleware already gates /account; this is the server-side belt to its
  // braces, because middleware can be bypassed by a direct RSC fetch.
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account");

  const consent = await queryOne<{
    tou_version: string | null;
    tou_accepted_at: Date | null;
    age_band: "adult" | "minor" | null;
    guardian_kind: string | null;
    guardian_confirmed_at: Date | null;
  }>(
    `SELECT tou_version, tou_accepted_at, age_band, guardian_kind, guardian_confirmed_at
       FROM users WHERE id = $1`,
    [session.user.id]
  );

  const account = {
    tier: session.user.tier,
    ageBand: session.user.ageBand,
    guardianConfirmed: session.user.guardianConfirmed,
  };
  const ceiling = maxLevelFor(account);
  const tierCeiling = TIER_MAX_LEVEL[account.tier];
  const reducedByAge = ceiling !== tierCeiling;
  const meta = LEVEL_META.find((m) => m.value === ceiling)!;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          {session.user.email}
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Research depth
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <LevelSymbol shape={meta.shape} size={20} />
          <div>
            <div className="font-medium">{meta.label}</div>
            <div className="text-sm text-slate-500">
              Plan: <strong>{account.tier}</strong>
              {reducedByAge && (
                <>
                  {" "}— limited to {meta.label} because an under-18 account&rsquo;s seat
                  must be held by a parent, guardian or school.
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Consent of record
        </h2>
        <dl className="mt-3 grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">Terms accepted</dt>
          <dd>
            {consent?.tou_version
              ? `${consent.tou_version}${
                  consent.tou_accepted_at
                    ? ` · ${new Date(consent.tou_accepted_at).toLocaleDateString()}`
                    : ""
                }`
              : "Not yet recorded"}
          </dd>

          <dt className="text-slate-500">Age band</dt>
          <dd>
            {consent?.age_band === "adult"
              ? "18 or older"
              : consent?.age_band === "minor"
                ? "Under 18"
                : "Not yet recorded"}
          </dd>

          <dt className="text-slate-500">May purchase</dt>
          <dd>
            {maySelfPurchase(account)
              ? "Yes"
              : "No — a parent, guardian or school must hold the seat (Terms §2)"}
          </dd>

          {consent?.guardian_kind && (
            <>
              <dt className="text-slate-500">Seat held by</dt>
              <dd>{consent.guardian_kind === "institution" ? "School / institution" : "Parent or guardian"}</dd>
            </>
          )}
        </dl>
        <p className="mt-3 text-xs text-slate-400">
          Age is currently self-declared. Verification is not yet implemented.
        </p>
      </section>
    </div>
  );
}
