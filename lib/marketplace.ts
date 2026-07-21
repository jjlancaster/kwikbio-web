import type { Vendor, VendorMatch } from './types';

function overlapScore(vendorSpecs: string[], requiredServices: string[]): number {
  if (requiredServices.length === 0) return 0.5;
  const hits = requiredServices.filter(s =>
    vendorSpecs.some(spec => spec.includes(s) || s.includes(spec))
  );
  return hits.length / requiredServices.length;
}

function normalizeTurnaround(days?: number): number {
  if (!days)     return 0.5;
  if (days <= 7)  return 1.0;
  if (days <= 30) return 0.8;
  if (days <= 90) return 0.5;
  return 0.2;
}

export function computeMatchScore(vendor: Vendor, requiredServices: string[]): number {
  const capability  = overlapScore(vendor.specializations, requiredServices);
  const trust       = vendor.trustScore;
  const turnaround  = normalizeTurnaround(vendor.turnaroundDays);
  const verified    = vendor.isVerified ? 1.0 : 0.7;
  return (capability * 0.40) + (trust * 0.30) + (turnaround * 0.20) + (verified * 0.10);
}

export function explainMatch(vendor: Vendor, requiredServices: string[]): string[] {
  const reasons: string[] = [];
  const overlap = overlapScore(vendor.specializations, requiredServices);
  if (overlap > 0.6)                              reasons.push(`${Math.round(overlap * 100)}% service match`);
  if (vendor.isVerified)                          reasons.push('verified');
  if (vendor.onlineCapable)                       reasons.push('online-capable');
  if (vendor.turnaroundDays && vendor.turnaroundDays <= 14) reasons.push(`${vendor.turnaroundDays}d TAT`);
  if (vendor.trustScore >= 0.8)                   reasons.push('high trust');
  return reasons;
}

export function rankVendors(vendors: Vendor[], requiredServices: string[]): VendorMatch[] {
  return vendors
    .map(v => ({
      vendor:       v,
      matchScore:   computeMatchScore(v, requiredServices),
      matchReasons: explainMatch(v, requiredServices),
      rank:         0,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((m, i) => ({ ...m, rank: i + 1 }));
}
