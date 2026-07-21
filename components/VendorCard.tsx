interface Vendor {
  id: string;
  name: string;
  slug: string;
  specializations: string[];
  trust_score: number;
  is_verified: boolean;
  avg_turnaround_days: number;
  matchScore?: number;
}

export default function VendorCard({
  vendor,
  onBook,
}: {
  vendor: Vendor;
  onBook?: (vendor: Vendor) => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-bio-navy/20 hover:border-bio-teal/40 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-slate-200">{vendor.name}</h3>
          <p className="text-xs text-slate-500 font-mono">{vendor.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {vendor.is_verified && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Verified</span>
          )}
          {vendor.matchScore !== undefined && (
            <span className="text-xs font-mono text-bio-gold">{(vendor.matchScore * 100).toFixed(0)}% match</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {(vendor.specializations ?? []).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full border border-bio-teal/30 text-bio-teal">{s}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 text-xs text-slate-500">
          <span>Trust: <span className="text-slate-300">{(vendor.trust_score * 100).toFixed(0)}%</span></span>
          <span>TAT: <span className="text-slate-300">{vendor.avg_turnaround_days}d</span></span>
        </div>
        {onBook && (
          <button onClick={() => onBook(vendor)}
            className="text-xs px-3 py-1 bg-bio-teal text-bio-navy font-semibold rounded hover:opacity-90">
            Book
          </button>
        )}
      </div>
    </div>
  );
}
