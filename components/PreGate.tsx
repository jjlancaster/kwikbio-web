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
 * Anonymous skip available for beta testers.
 */
export default function PreGate({
  queryText,
  queryCount = 1,
  onAuthSuccess,
  visible,
}: PreGateProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { email: email.trim(), password, name: name.trim() || undefined }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { token?: string; user?: unknown; error?: string };

      if (!res.ok || !data.token) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      // Persist token
      if (typeof window !== "undefined") {
        localStorage.setItem("kwikbio_token", data.token);
        localStorage.setItem("kwikbio_user", JSON.stringify(data.user ?? {}));
      }

      setDone(true);
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading
                ? mode === "register" ? "Creating account…" : "Signing in…"
                : mode === "register" ? "Create free account →" : "Sign in →"}
            </button>
          </form>
        ) : (
          <div className="text-green-600 text-sm font-medium">
            ✓ {mode === "register" ? "Account created!" : "Signed in!"} Full access unlocked.
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
