"use client";
import { useState } from "react";
import VendorCard from "./VendorCard";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  specializations: string[];
  trust_score: number;
  is_verified: boolean;
  avg_turnaround_days: number;
  matchScore: number;
}

interface SubmitResult {
  experimentId: string;
  matches: Vendor[];
  selected: Vendor | null;
  totalVendorsScored: number;
}

export default function ExperimentChooser({
  experimentId,
  hypothesisId,
}: {
  experimentId: string;
  hypothesisId: string;
}) {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    const resp = await fetch("/api/marketplace/experiments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentId, hypothesisId }),
    });
    setResult(await resp.json());
    setLoading(false);
  }

  async function book(vendor: Vendor) {
    setBooking(vendor.id);
    const resp = await fetch("/api/marketplace/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: vendor.id, experimentId }),
    });
    if (resp.ok) setBookedId(vendor.id);
    setBooking(null);
  }

  if (!experimentId || !hypothesisId) {
    return <p className="text-sm text-slate-500">Select a hypothesis and experiment first.</p>;
  }

  return (
    <div className="space-y-4">
      {!result && (
        <button onClick={run} disabled={loading}
          className="px-4 py-2 bg-bio-teal text-bio-navy font-semibold text-sm rounded-md hover:opacity-90 disabled:opacity-50">
          {loading ? "Matching vendors…" : "Auto-match CRO Vendors"}
        </button>
      )}

      {result && (
        <>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-bio-gold">Matched Vendors</h3>
            <span className="text-xs text-slate-500">{result.totalVendorsScored} scored</span>
            <button onClick={() => setResult(null)}
              className="text-xs text-slate-500 hover:text-slate-300 underline ml-auto">Re-run</button>
          </div>

          {result.selected && (
            <div className="p-3 rounded-lg border border-bio-gold/40 bg-bio-gold/5">
              <p className="text-xs text-bio-gold font-semibold mb-2">★ Auto-selected top match</p>
              <VendorCard
                vendor={result.selected}
                onBook={bookedId ? undefined : (v) => book(v as Vendor)}
              />
              {booking === result.selected.id && (
                <p className="text-xs text-slate-400 mt-2">Creating booking…</p>
              )}
              {bookedId === result.selected.id && (
                <p className="text-xs text-green-400 mt-2">Booking created — pending vendor acceptance.</p>
              )}
            </div>
          )}

          {result.matches.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-xs text-slate-400 font-semibold uppercase">Other matches</h4>
              {result.matches.slice(1).map((v) => (
                <VendorCard key={v.id} vendor={v}
                  onBook={bookedId ? undefined : (vendor) => book(vendor as Vendor)} />
              ))}
            </div>
          )}

          {result.matches.length === 0 && (
            <p className="text-sm text-slate-500">No verified vendors found. Add CROs via the admin panel.</p>
          )}
        </>
      )}
    </div>
  );
}
