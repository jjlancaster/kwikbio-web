"use client";

// R1 — the "what you're missing" upgrade prompt. Shown when an anonymous/
// freemium user taps a locked Level marker. Shows the ski-trail markers with the
// entitled ones unlocked and the rest locked, and routes to sign-up / pricing.

import Link from "next/link";
import type { Level } from "@/lib/ars-query";
import { LEVEL_META, LevelSymbol } from "./LevelSymbol";
import { LEVEL_RANK } from "./Entitlement";

const UNLOCK_COPY: Record<Level, string> = {
  beginner: "Open to everyone — plain-language answers, no account needed.",
  novice: "Sign up free to unlock Novice: terminology, confidence, more routes.",
  pro: "Go Pro for full depth: every layer, provenance, LOPE/SSKM, all pathways.",
};

export default function UpgradePrompt({
  open,
  lockedLevel,
  maxLevel,
  onClose,
}: {
  open: boolean;
  lockedLevel: Level | null;
  maxLevel: Level;
  onClose: () => void;
}) {
  if (!open || !lockedLevel) return null;
  const meta = LEVEL_META.find((l) => l.value === lockedLevel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unlock deeper research"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-bio-navy p-6 text-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-bio-teal">
          Locked {meta?.label ?? lockedLevel}
        </div>
        <h2 className="mb-4 text-xl font-semibold text-white">See what you&rsquo;re missing</h2>

        {/* The three levels, entitled ones lit, the rest locked. */}
        <ul className="mb-5 space-y-2">
          {LEVEL_META.map((l) => {
            const locked = LEVEL_RANK[l.value] > LEVEL_RANK[maxLevel];
            return (
              <li
                key={l.value}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  locked ? "border-white/10 bg-white/[0.02] opacity-70" : "border-bio-teal/30 bg-bio-teal/5"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-white">
                  <LevelSymbol shape={l.shape} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                    {l.label}
                    {locked && <span aria-hidden className="text-slate-500">🔒</span>}
                  </div>
                  <div className="text-xs text-slate-400">{UNLOCK_COPY[l.value]}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2">
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex-1 rounded-md bg-bio-teal px-4 py-2.5 text-center text-sm font-semibold text-bio-navy hover:opacity-90"
          >
            Unlock {meta?.label ?? lockedLevel} →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
          >
            Keep exploring free
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          Easy stays free, always — no account needed.
        </p>
      </div>
    </div>
  );
}
