import Link from "next/link";

  export default function Footer() {
    return (
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-slate-600 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="font-semibold text-slate-900 mb-2">kwiKBio</div>
            <p>The fastest path from research question to breakthrough.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">Product</div>
            <ul className="space-y-1">
              <li><Link href="/about">What is kwiKBio?</Link></li>
              <li><Link href="/gateway">Gateway</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">Ecosystem</div>
            <ul className="space-y-1">
              <li><a href="https://biounicorn.ai">BioUnicorn.ai</a></li>
              <li><a href="https://crowdcuredisease.ai">CrowdCureDisease.ai</a></li>
              <li><a href="https://vermontmedicalcollege.com">VermontMedicalCollege.com</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">Legal</div>
            <ul className="space-y-1">
              <li><Link href="/legal/privacy">Privacy</Link></li>
              <li><Link href="/legal/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} HydroJoule LLC · kwiKBio Inc. · US Patent 11,282,088
        </div>
      </footer>
    );
  }
  