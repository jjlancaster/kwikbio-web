"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Only allow internal, single-slash absolute paths. Blocks open redirects via
// ?next=https://evil, ?next=//evil, or backslash-smuggled targets.
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/dashboard";
  return value;
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignup ? { name, email, password } : { email, password };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      if (isSignup && !data.authed) {
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-md border border-shell-border bg-shell-bg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-secondary/50 focus:border-accent focus:outline-none";

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-shell-bg px-4 text-ink-primary">
      <div className="w-full max-w-sm rounded-xl border border-shell-border bg-shell-surface p-7">
        <Link href="/" className="block text-center text-xl font-semibold">
          kwi<span className="text-accent">K</span>Bio
        </Link>
        <h1 className="mt-5 text-center text-lg font-medium">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {isSignup && (
            <input
              className={field}
              placeholder="Name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className={field}
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            type="password"
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-vertical-bio">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-shell-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-secondary">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New to kwiKBio?{" "}
              <Link href="/signup" className="text-accent hover:underline">
                Start free
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
