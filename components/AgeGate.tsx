"use client";

// R2 — age gate (18+ vs <18). Fires only at legally-gated actions (account /
// purchase / SciCrush). Adult → proceed. Minor → cannot self-purchase and is
// blocked from SciCrush; research access needs parental or classroom approval.
// DRAFT copy — final wording + consent mechanism from counsel.

import { useState } from "react";

export default function AgeGate({
  reason,
  onAdult,
  onMinor,
  onClose,
}: {
  reason?: string;
  onAdult: () => void;
  onMinor: () => void;
  onClose: () => void;
}) {
  const [declaredMinor, setDeclaredMinor] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-bio-navy p-6 text-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-bio-teal">
          Age check
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Are you 18 or older?</h2>
        {reason ? <p className="mb-4 text-sm text-slate-400">{reason}</p> : <div className="mb-2" />}

        {!declaredMinor ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onAdult}
              className="w-full rounded-md bg-bio-teal px-4 py-2.5 text-sm font-semibold text-bio-navy hover:opacity-90"
            >
              Yes — I am 18 or older
            </button>
            <button
              type="button"
              onClick={() => {
                setDeclaredMinor(true);
                onMinor();
              }}
              className="w-full rounded-md border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              No — I am under 18
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
              <p className="font-medium">Under-18 access needs an adult&rsquo;s approval.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-100/90">
                <li>You <strong>can&rsquo;t buy a subscription yourself</strong> — a parent/guardian or your school/classroom authorizes and pays.</li>
                <li><strong>SciCrush is 18+ only</strong> and stays unavailable.</li>
                <li>Free knowledge search (Easy) remains open to you.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-bio-teal px-4 py-2.5 text-sm font-semibold text-bio-navy hover:opacity-90"
            >
              Got it — keep exploring free
            </button>
          </div>
        )}
        <p className="mt-3 text-center text-[11px] italic text-slate-500">
          [DRAFT — age-verification mechanism pending legal review.]
        </p>
      </div>
    </div>
  );
}
