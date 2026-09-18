"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
      });
      const data = await res.json() as { token?: string; user?: unknown; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error ?? `Error ${res.status}`);

      localStorage.setItem("kwikbio_token", data.token);
      localStorage.setItem("kwikbio_user", JSON.stringify(data.user ?? {}));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bio-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl text-bio-gold">
            kwi<span className="text-white">K</span>Bio
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Create your free Freemium account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-8 py-8">
          <h1 className="text-xl font-semibold text-white mb-1">Get started — it&apos;s free</h1>
          <p className="text-slate-400 text-sm mb-6">
            5 ARS queries/month. No credit card.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-sm"
              />
            </div>
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
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-bio-teal focus:ring-1 focus:ring-bio-teal text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-bio-teal px-6 py-3.5 font-semibold text-bio-navy hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              {loading ? "Creating account…" : "Create free account →"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-bio-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          By registering, you agree to our{" "}
          <Link href="/legal/terms" className="hover:text-slate-400">Terms</Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="hover:text-slate-400">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
