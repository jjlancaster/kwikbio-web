"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export interface PreGateProps {
  queryText: string;
  queryCount?: number;
  onAuthSuccess?: () => void;
  visible: boolean;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * PreGate — The conversion moment overlay for kwiKBio /demo.
 * Mounts above blurred D4/D5/hypothesis content.
 * Spec: specs/KWIKBIO-PREGATE-UX-SPEC-2026-07-05.md
 */
export default function PreGate({
  queryText,
  queryCount = 1,
  onAuthSuccess,
  visible,
}: PreGateProps) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  const primaryCopy =
    queryCount >= 2
      ? `You've run ${queryCount} queries. Sign in to unlock all results.`
      : "Sign in to see what the system ranked #1 and why.";

  async function handleGoogleOAuth() {
    setLoading(true);
    setError(null);
    const sb = getSupabaseClient();
    if (!sb) { setError("Auth not configured."); setLoading(false); return; }
    try {
      const { error: err } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/demo?unlocked=1` },
      });
      if (err) setError(err.message);
      else track("pregate_auth_click", { method: "google", query: queryText });
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const sb = getSupabaseClient();
    if (!sb) { setError("Auth not configured."); setLoading(false); return; }
    try {
      const { error: err } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/demo?unlocked=1` },
      });
      if (err) { setError(err.message); }
      else {
        setEmailSent(true);
        track("pregate_auth_click", { method: "email", query: queryText });
      }
    } finally {
      setLoading(false);
    }
  }

  function track(event: string, props: object) {
    if (typeof window === "undefined") return;
    const w = window as unknown as Record<string, unknown>;
    if (w.analytics && typeof (w.analytics as Record<string, unknown>).track === "function") {
      (w.analytics as { track: (e: string, p: object) => void }).track(event, props);
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

        {!emailMode && !emailSent && (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleGoogleOAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading ? <span className="animate-spin inline-block">⟳</span> : <span>G</span>}
              Sign in with Google
            </button>
            <button
              onClick={() => setEmailMode(true)}
              disabled={loading}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors bg-white"
            >
              Sign in with email
            </button>
          </div>
        )}

        {emailMode && !emailSent && (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3 w-full">
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
              {loading ? "Sending…" : "Send magic link"}
            </button>
            <button
              type="button"
              onClick={() => setEmailMode(false)}
              className="text-gray-400 text-xs hover:text-gray-600"
            >
              ← Back
            </button>
          </form>
        )}

        {emailSent && (
          <div className="text-green-600 text-sm font-medium">
            ✓ Check your email — magic link sent to {email}
          </div>
        )}

        <p className="text-gray-400 text-xs">No credit card. No trial. Free research access.</p>
      </div>
    </div>
  );
}
