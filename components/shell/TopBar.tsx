"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar({
  user,
  onToggleMobile,
  onToggleCollapse,
}: {
  user: { email?: string | null };
  onToggleMobile: () => void;
  onToggleCollapse: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary hover:bg-white/5 hover:text-ink-primary";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-shell-border bg-shell-surface px-4">
      <button onClick={onToggleMobile} className={`${iconBtn} md:hidden`} aria-label="Open navigation">
        <span aria-hidden>≡</span>
      </button>
      <button
        onClick={onToggleCollapse}
        className={`${iconBtn} hidden md:inline-flex`}
        aria-label="Collapse navigation"
      >
        <span aria-hidden>≡</span>
      </button>

      <Link href="/dashboard" className="font-semibold tracking-tight">
        kwi<span className="text-accent">K</span>Bio
      </Link>

      <div className="mx-auto hidden w-full max-w-md sm:block">
        <input
          type="search"
          placeholder="Search…"
          className="w-full rounded-md border border-shell-border bg-shell-bg px-3 py-1.5 text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="relative ml-auto">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs text-accent">
            {(user?.email ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-[12rem] truncate sm:inline">{user?.email ?? "Account"}</span>
          <span aria-hidden>▾</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-shell-border bg-shell-surface py-1 shadow-lg">
            <Link
              href="/settings"
              className="block px-3 py-2 text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="block w-full px-3 py-2 text-left text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
