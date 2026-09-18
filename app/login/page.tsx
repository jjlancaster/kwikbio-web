"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { token?: string; user?: unknown; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error ?? `Error ${res.status}`);

      localStorage.setItem("kwikbio_token", data.token);
      localStorage.setItem("kwikbio_user", JSON.stringify(data.user ?? {}));

      // Redirect back to wherever they came from, or home
      const returnTo = new URLSearchParams(window.location.search).get("returnTo") ?? "/";
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bio-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl text-bio-gold">
            kwi<span className="text-white">K</span>Bio
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-8 py-8">
          <h1 className="text-xl font-semibold text-white mb-6">Welcome back</h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-bio-teal px-6 py-3.5 font-semibold text-bio-navy hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to kwiKBio?{" "}
            <Link href="/register" className="text-bio-teal hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
