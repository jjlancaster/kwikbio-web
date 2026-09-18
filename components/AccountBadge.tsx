"use client";

// Nav sign-in control. Deliberately small and non-blocking: the whole point of
// the freemium path is that a visitor can use the search without ever touching
// this, so it must never look like a wall.

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AccountBadge() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="h-8 w-16 rounded-md bg-white/5" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/signin"
        className="text-sm text-slate-300 hover:text-bio-teal transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const label = session.user.name ?? session.user.email ?? "Account";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        title={`${label} · ${session.user.tier}`}
        className="max-w-[10rem] truncate text-sm text-slate-300 hover:text-bio-teal transition-colors"
      >
        {label}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-slate-500 hover:text-slate-300"
      >
        Sign out
      </button>
    </div>
  );
}
