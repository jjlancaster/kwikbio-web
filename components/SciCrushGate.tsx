"use client";

// R2 — SciCrush is 18+ ADULT-ONLY (dating/social matching). Hard gate: a minor
// is blocked unconditionally, even with parental/classroom research approval.
// Renders the page only for a confirmed adult; otherwise an 18+ interstitial.
//
// NOTE: client-side gating is the best available until auth exists. Once there
// are accounts/sessions, the SciCrush API + page MUST also enforce this
// server-side — do not rely on this component alone.

import { useConsent } from "./Consent";

export default function SciCrushGate({ children }: { children: React.ReactNode }) {
  const { hydrated, ageBand, isAdult, setAgeBand } = useConsent();

  // Before hydration, don't flash the page or the block — render nothing.
  if (!hydrated) return null;
  if (isAdult) return <>{children}</>;

  const isMinor = ageBand === "minor";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-bio-navy px-4 py-16 text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
        <div className="mb-2 text-4xl">🔞</div>
        <h1 className="mb-2 text-2xl font-semibold text-white">SciCrush is 18+</h1>
        <p className="mb-6 text-sm text-slate-400">
          SciCrush includes dating and social-matching features and is available to
          adults 18 and older only.
        </p>

        {isMinor ? (
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
            This area is not available to under-18 accounts. You can keep using the
            free knowledge search anytime.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setAgeBand("adult")}
              className="w-full rounded-md bg-bio-teal px-4 py-2.5 text-sm font-semibold text-bio-navy hover:opacity-90"
            >
              I am 18 or older — enter
            </button>
            <button
              type="button"
              onClick={() => setAgeBand("minor")}
              className="w-full rounded-md border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              I am under 18
            </button>
          </div>
        )}
        <p className="mt-4 text-[11px] italic text-slate-500">
          [DRAFT — age-verification mechanism pending legal review.]
        </p>
      </div>
    </div>
  );
}
