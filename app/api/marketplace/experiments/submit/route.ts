import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db/pg";
import { computeMatchScore } from "@/lib/marketplace";
import type { Vendor } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    experimentId?: string | number;
    hypothesisId?: string | number;
    requiredServices?: string[];
  } | null;

  if (!body?.experimentId || !body?.hypothesisId) {
    return NextResponse.json({ error: "experimentId and hypothesisId required" }, { status: 400 });
  }

  try {
    const exp = await queryOne(
      'SELECT * FROM lope_experiments WHERE id=$1', [body.experimentId],
    );
    if (!exp) return NextResponse.json({ error: "experiment not found" }, { status: 404 });

    const vendors = await query<Vendor>(
      'SELECT * FROM vendors WHERE is_verified = TRUE AND is_active = TRUE',
    );

    const requiredServices: string[] =
      body.requiredServices ?? ((exp.domain as string) ? [exp.domain as string] : []);

    const scored = vendors
      .map((v) => ({ vendor: v, score: computeMatchScore(v, requiredServices) }))
      .sort((a, b) => b.score - a.score);

    const top5 = scored.slice(0, 5);

    if (top5.length > 0) {
      for (const s of top5) {
        await query(
          `INSERT INTO vendor_matches (experiment_id, vendor_id, match_score, match_reasons)
           VALUES ($1, $2, $3, $4) ON CONFLICT (experiment_id, vendor_id) DO UPDATE
           SET match_score=$3, match_reasons=$4`,
          [body.experimentId, (s.vendor as unknown as { id: unknown }).id, s.score, requiredServices],
        );
      }
    }

    return NextResponse.json({
      experimentId: body.experimentId,
      hypothesisId: body.hypothesisId,
      matches: top5.map((s) => ({ ...s.vendor, matchScore: +s.score.toFixed(4) })),
      selected: top5[0] ? { ...top5[0].vendor, matchScore: +top5[0].score.toFixed(4) } : null,
      totalVendorsScored: vendors.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
