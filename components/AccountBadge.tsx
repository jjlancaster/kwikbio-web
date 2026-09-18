"use client";

// Nav account control.
//
// The visual design (initials avatar, name, tier chip, Log in / Sign Up Free)
// comes from Joule's Nav on main; the DATA does not. That version read
// `kwikbio_token` / `kwikbio_user` out of localStorage — values the visitor can
// edit, pointing at a `/api/auth/login` endpoint that was never built. Anyone
// could grant themselves any tier by typing it into devtools.
//
// Same design, backed by the real session instead, so the tier shown here is
// the tier the server will actually honour.
//
// Deliberately non-blocking: the whole point of the freemium path is that a
// visitor can use the search without ever touching this, so it must never read
// as a wall.

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AccountBadge() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="h-8 w-24 rounded-md bg-white/5" aria-hidden />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <>
        <Link
          href="/signin"
          className="text-sm border border-white/20 text-slate-300 px-4 py-2 rounded-md hover:border-white/40 hover:text-white transition"
        >
          Log in
        </Link>
        <Link
          href="/signin"
          className="text-sm bg-bio-teal text-bio-navy font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Sign Up Free
        </Link>
      </>
    );
  }

  const initials = user.name
    ? user.name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <Link
        href="/account"
        className="hidden md:flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bio-teal text-bio-navy font-bold text-xs">
          {initials}
        </span>
        <span className="max-w-[140px] truncate">{user.name || user.email}</span>
        <span className="text-xs text-bio-gold uppercase tracking-wide">({user.tier})</span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm border border-white/20 text-slate-400 px-3 py-1.5 rounded-md hover:border-white/40 hover:text-white transition"
      >
        Log out
      </button>
    </>
  );
}
