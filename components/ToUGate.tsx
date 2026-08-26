"use client";

// R2 — first-page Terms of Use + disclaimer gate. Blocks first substantive use
// until accepted (one-time, versioned). DRAFT copy — final wording from counsel.

import Link from "next/link";
import { useState } from "react";

export default function ToUGate({ onAccept }: { onAccept: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terms of Use"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-bio-navy p-6 text-slate-200 shadow-2xl">
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-bio-teal">
          Before you begin
        </div>
        <h2 className="mb-3 text-xl font-semibold text-white">Terms of Use &amp; Disclaimer</h2>

        {/* DRAFT placeholder — replace with counsel-approved text. */}
        <div className="mb-4 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
          <p>
            <strong className="text-white">Research decision-support, not medical advice.</strong> kwiKBio
            surfaces AI- and knowledge-graph-generated hypotheses for research and
            education. It is <em>not</em> a substitute for professional medical, clinical,
            or legal advice, diagnosis, or treatment. Always consult a qualified
            professional.
          </p>
          <p>
            Results carry confidence and provenance signals and may be incomplete or
            wrong. You are responsible for independently verifying anything you rely on.
          </p>
          <p>
            <strong className="text-white">Free use contributes to the public commons.</strong> On the
            free (Freemium) tier, knowledge generated from your use is added to the public
            knowledge database — which includes linked HydroJoule resources. Subscribers may
            keep work private in an Inrupt/Solid POD repository; Enterprise can run entirely
            on private models. See{" "}
            <Link href="/legal/terms" className="text-bio-teal underline">Terms of Use §5</Link>.
          </p>
          <p>
            <strong className="text-white">Age.</strong> Some features require you to be 18 or older.
            Under-18 users may use the free knowledge search but cannot buy a subscription
            themselves — a parent/guardian or school must authorize it.{" "}
            <strong className="text-white">SciCrush is 18+ only.</strong>
          </p>
          <p className="text-slate-400">
            By continuing you agree to the{" "}
            <Link href="/legal/terms" className="text-bio-teal underline">Terms of Use</Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-bio-teal underline">Privacy Policy</Link>,
            governed by the laws of Vermont, USA.
          </p>
          <p className="text-[11px] italic text-slate-500">
            [DRAFT notice — placeholder text pending legal review.]
          </p>
        </div>

        <label className="mb-4 flex items-start gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-bio-teal"
          />
          <span>
            I have read and agree to the Terms of Use and Privacy Policy. I understand
            this is research decision-support, not medical advice, and that free-tier
            results are contributed to the public knowledge database.
          </span>
        </label>

        <button
          type="button"
          disabled={!confirmed}
          onClick={onAccept}
          className="w-full rounded-md bg-bio-teal px-4 py-2.5 text-sm font-semibold text-bio-navy hover:opacity-90 disabled:opacity-40"
        >
          Agree &amp; continue
        </button>
      </div>
    </div>
  );
}
