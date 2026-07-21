import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-white/10 bg-bio-navy/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-bio-gold">
          kwi<span className="text-white">K</span>Bio
        </Link>
        <nav className="hidden md:flex gap-6 text-sm text-slate-300">
          <Link href="/research" className="hover:text-bio-teal transition-colors">Research</Link>
          <Link href="/gateway" className="hover:text-bio-teal transition-colors">Gateway</Link>
          <Link href="/marketplace" className="hover:text-bio-teal transition-colors">CRO Market</Link>
          <Link href="/scicrush" className="hover:text-bio-teal transition-colors">SciCrush</Link>
          <Link href="/pricing" className="hover:text-bio-teal transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-bio-teal transition-colors">Blog</Link>
        </nav>
        <Link
          href="/pricing"
          className="text-sm bg-bio-teal text-bio-navy font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Start Free
        </Link>
      </div>
    </header>
  );
}
