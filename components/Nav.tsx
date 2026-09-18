"use client";

import Link from "next/link";
import LevelBadge from "@/components/LevelBadge";
import AccountBadge from "@/components/AccountBadge";

export default function Nav() {
  return (
    <header className="border-b border-white/10 bg-bio-navy/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/navigator" className="font-bold text-xl text-bio-gold">
          kwi<span className="text-white">K</span>Bio
        </Link>
        <nav className="hidden md:flex gap-6 text-sm text-slate-300">
          <Link href="/navigator" className="hover:text-bio-teal transition-colors">Navigator</Link>
          <Link href="/demo" className="hover:text-bio-teal transition-colors">Demo</Link>
          <Link href="/research" className="hover:text-bio-teal transition-colors">Research</Link>
          <Link href="/marketplace" className="hover:text-bio-teal transition-colors">CRO Market</Link>
          {/* Kept from this branch: R2 wraps /scicrush in the 18+ gate, and
              main's nav had no link to it — the gate would be unreachable. */}
          <Link href="/scicrush" className="hover:text-bio-teal transition-colors">SciCrush</Link>
          <Link href="/pricing" className="hover:text-bio-teal transition-colors">Pricing</Link>
          <Link href="/welcome" className="hover:text-bio-teal transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          {/* Persistent Level badge — sets the app-wide research depth (U1). */}
          <LevelBadge compact />
          {/* Session-backed account control (M-AUTH). */}
          <AccountBadge />
        </div>
      </div>
    </header>
  );
}
