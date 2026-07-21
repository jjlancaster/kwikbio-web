"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  specializations: string[];
  trust_score: number;
  is_verified: boolean;
  avg_turnaround_days: number;
  kbkg_node_id?: string;
}

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/marketplace/vendors?search=${encodeURIComponent(slug)}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        const match = (data.vendors ?? []).find((v: Vendor) => v.slug === slug);
        if (match) setVendor(match);
        else setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-bio-navy text-slate-200">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/marketplace"
          className="text-sm text-bio-teal hover:underline mb-6 inline-block">← Back to marketplace</Link>

        {loading && <p className="text-slate-500">Loading…</p>}
        {notFound && <p className="text-slate-500">Vendor not found.</p>}

        {vendor && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-bio-gold">{vendor.name}</h1>
                <p className="text-slate-500 font-mono text-sm mt-1">{vendor.slug}</p>
              </div>
              {vendor.is_verified && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">Verified CRO</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { val: `${(vendor.trust_score * 100).toFixed(0)}%`, label: "Trust Score", color: "text-bio-gold" },
                { val: `${vendor.avg_turnaround_days}d`,           label: "Avg Turnaround", color: "text-bio-teal" },
                { val: String(vendor.specializations?.length ?? 0), label: "Capabilities",  color: "text-slate-200" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg border border-slate-700 bg-bio-navy/40 text-center">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.val}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase mb-2">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {(vendor.specializations ?? []).map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full border border-bio-teal/30 text-bio-teal text-sm">{s}</span>
                ))}
              </div>
            </div>

            {vendor.kbkg_node_id && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase mb-1">Knowledge Graph Node</h2>
                <p className="text-xs font-mono text-slate-500">{vendor.kbkg_node_id}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-700">
              <Link href="/research"
                className="inline-block px-6 py-3 bg-bio-teal text-bio-navy font-semibold rounded-lg hover:opacity-90">
                Run an experiment with this vendor →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
