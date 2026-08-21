"use client";

import { useState } from "react";

export interface PreGateProps {
  queryText: string;
  queryCount?: number;
  onAuthSuccess?: () => void;
  visible: boolean;
}

/**
 * PreGate — Conversion overlay for kwiKBio /demo.
 * Auth via kwikbio-api (JWT) — no Supabase dependency.
 */
export default function PreGate({
  queryText,
  queryCount = 1,
  onAuthSuccess,
  visible,
}: PreGateProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  const primaryCopy =
    queryCount >= 2
      ? "You've run 2 queries. Sign up to keep exploring."
      : `Unlock the full causal chain for "${queryText}".`;

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pregate", query: queryText }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? `Server error ${res.status}`);
      }
      setEmailSent(true);
      onAuthSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        background: "rgba(255, 255, 255, 0.72)",
      }}
    >
      <div className="flex flex-col items-center gap-5 px-6 py-8 max-w-sm w-full text-center">
        <div className="text-4xl">🔒</div>
        <p className="text-gray-900 font-semibold text-lg leading-snug">{primaryCopy}</p>
        <p className="text-gray-500 text-sm">
          The ARS confidence score and full causal chain are visible to registered users.{" "}
          <span className="font-medium text-gray-700">Free forever.</span>
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!emailSent ? (
          <form onSubmit={handleWaitlist} className="flex flex-col gap-3 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading ? "Joining…" : "Get early access — free"}
            </button>
          </form>
        ) : (
          <div className="text-green-600 text-sm font-medium">
            ✓ You&apos;re on the list! We&apos;ll be in touch at {email}.
          </div>
        )}

        <p className="text-gray-400 text-xs">No credit card. No trial. Free research access.</p>
      </div>
    </div>
  );
}
