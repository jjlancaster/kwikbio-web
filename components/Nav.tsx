"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface KwikBioUser {
  id?: number;
  email?: string;
  name?: string;
  tier?: string;
}

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<KwikBioUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("kwikbio_token");
    const raw = localStorage.getItem("kwikbio_user");
    if (token && raw) {
      try {
        setUser(JSON.parse(raw) as KwikBioUser);
      } catch {
        // malformed stored user
      }
    }
    // Listen for storage events so login/logout in other tabs syncs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "kwikbio_token") {
        const tok = localStorage.getItem("kwikbio_token");
        const raw2 = localStorage.getItem("kwikbio_user");
        if (tok && raw2) {
          try { setUser(JSON.parse(raw2) as KwikBioUser); } catch { setUser(null); }
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("kwikbio_token");
    localStorage.removeItem("kwikbio_user");
    setUser(null);
    router.push("/");
  }

  const initials = user?.name
    ? user.name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

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
          <Link href="/pricing" className="hover:text-bio-teal transition-colors">Pricing</Link>
          <Link href="/welcome" className="hover:text-bio-teal transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:flex items-center gap-2 text-sm text-slate-300">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bio-teal text-bio-navy font-bold text-xs">
                  {initials}
                </span>
                <span className="max-w-[140px] truncate">{user.name || user.email}</span>
                {user.tier && (
                  <span className="text-xs text-bio-gold uppercase tracking-wide">({user.tier})</span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm border border-white/20 text-slate-400 px-3 py-1.5 rounded-md hover:border-white/40 hover:text-white transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm border border-white/20 text-slate-300 px-4 py-2 rounded-md hover:border-white/40 hover:text-white transition"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-bio-teal text-bio-navy font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
