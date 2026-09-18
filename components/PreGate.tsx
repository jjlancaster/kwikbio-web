"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export interface PreGateProps {
  queryText: string;
  queryCount?: number;
  onAuthSuccess?: () => void;
  visible: boolean;
}

/**
 * PreGate — Conversion overlay for kwiKBio /demo.
 *
 * Signs in through Auth.js (M-AUTH), not the old kwikbio-api JWT flow. That
 * flow posted to /api/auth/login and /api/auth/register, which were never
 * built, and kept the resulting token in localStorage — a value the visitor
 * could edit. Those paths are now served by the Auth.js catch-all, so leaving
 * them would fail loudly rather than silently.
 *
 * There is no password field because there is no credentials provider: sign-in
 * is a magic link, which also covers "register" (Auth.js creates the account on
 * first use). Anonymous skip is preserved — freemium must stay open.
 */
export default function PreGate({
  queryText,
  queryCount = 1,
  onAuthSuccess,
  visible,
}: PreGateProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  const primaryCopy =
    queryCount >= 2
      ? "You've run 2 queries — create a free account to keep exploring."
      : `Unlock the full causal chain for "${queryText}".`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // redirect:false so the "check your email" state renders in place rather
      // than navigating away from the demo the visitor is mid-way through.
      const res = await signIn("nodemailer", {
        email: email.trim(),
        callbackUrl: "/demo",
        redirect: false,
      });
      if (res?.error) throw new Error("Could not send the sign-in link.");
      setDone(true);
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
      <div className="flex flex-col items-center gap-4 px-6 py-7 max-w-sm w-full text-center">
        <div className="text-3xl">{mode === "register" ? "🔬" : "🔑"}</div>
        <p className="text-gray-900 font-semibold text-base leading-snug">{primaryCopy}</p>
        <p className="text-gray-500 text-sm">
          {mode === "register"
            ? "Free forever. Full causal chains unlocked instantly."
            : "Welcome back — sign in to continue your research."}
        </p>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-full">
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign in
          </button>
        </div>

        {error && <p className="text-red-500 text-sm w-full text-left">{error}</p>}

        {!done ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 w-full">
            {mode === "register" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading
                ? "Sending link…"
                : mode === "register" ? "Email me a sign-in link →" : "Email me a sign-in link →"}
            </button>
          </form>
        ) : (
          <div className="text-green-600 text-sm font-medium">
            ✓ Check your email for a sign-in link.
          </div>
        )}

        {/* Anonymous bypass — important for beta */}
        <button
          type="button"
          onClick={() => onAuthSuccess?.()}
          className="w-full border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 font-medium text-sm py-2.5 px-4 rounded-lg transition-colors bg-white hover:bg-gray-50"
        >
          Try as guest (no account needed) →
        </button>

        <p className="text-gray-400 text-xs">Beta access is free. No credit card, ever.</p>
      </div>
    </div>
  );
}
