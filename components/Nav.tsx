import Link from "next/link";

  export default function Nav() {
    return (
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-brand-700">kwi<span className="text-slate-900">K</span>Bio</Link>
          <nav className="flex gap-6 text-sm text-slate-700">
            <Link href="/about" className="hover:text-brand-700">About</Link>
            <Link href="/gateway" className="hover:text-brand-700">Gateway</Link>
            <Link href="/pricing" className="hover:text-brand-700">Pricing</Link>
            <Link href="/blog" className="hover:text-brand-700">Blog</Link>
          </nav>
          <Link href="/pricing" className="text-sm bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700">Start Free</Link>
        </div>
      </header>
    );
  }
  