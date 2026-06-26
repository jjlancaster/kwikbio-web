"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import VendorCard from "@/components/VendorCard";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  specializations: string[];
  trust_score: number;
  is_verified: boolean;
  avg_turnaround_days: number;
}

const SPECS = ["genomics","proteomics","metabolomics","imaging","drug-screening","CRISPR","sequencing","bioinformatics"];

export default function MarketplacePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [search, spec, verifiedOnly]);

  async function load() {
    setLoading(true);
    const p = new URLSearchParams({ limit: "40" });
    if (search) p.set("search", search);
    if (spec)   p.set("specialization", spec);
    if (verifiedOnly) p.set("verified", "true");
    const resp = await fetch(`/api/marketplace/vendors?${p}`);
    const data = await resp.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bio-navy text-slate-200">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bio-gold mb-1">CRO Marketplace</h1>
          <p className="text-slate-400 text-sm">Verified contract research organizations. VOI-ranked, auto-matched to your hypotheses.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            className="flex-1 min-w-52 px-4 py-2 rounded-lg border border-slate-700 bg-bio-navy/60 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-bio-teal"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded-lg border border-slate-700 bg-bio-navy text-slate-200 text-sm focus:outline-none"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}>
            <option value="">All specializations</option>
            {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded accent-bio-teal" />
            Verified only
          </label>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading vendors…</p>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg mb-2">No vendors found</p>
            <p className="text-sm">Adjust your filters or add CROs via the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
