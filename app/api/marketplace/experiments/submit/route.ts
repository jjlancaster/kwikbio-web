import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { computeMatchScore } from "@/lib/marketplace";
import type { Vendor } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    experimentId?: string;
    hypothesisId?: string;
    requiredServices?: string[];
  } | null;

  if (!body?.experimentId || !body?.hypothesisId) {
    return NextResponse.json(
      { error: "experimentId and hypothesisId required" },
      { status: 400 }
    );
  }

  // Fetch the experiment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exp, error: expErr } = await (supabase as any)
    .from("lope_experiments")
    .select("*")
    .eq("id", body.experimentId)
    .single();
  if (expErr || !exp) {
    return NextResponse.json({ error: "experiment not found" }, { status: 404 });
  }

  // Fetch active vendors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: vendors, error: vendorErr } = await (supabase as any)
    .from("vendors")
    .select("*")
    .eq("is_verified", true);
  if (vendorErr) return NextResponse.json({ error: vendorErr.message }, { status: 500 });

  const requiredServices: string[] = body.requiredServices ?? (exp.domain ? [exp.domain] : []);

  // Score and rank
  const scored = ((vendors ?? []) as Vendor[])
    .map((v) => ({ vendor: v, score: computeMatchScore(v, requiredServices) }))
    .sort((a, b) => b.score - a.score);

  const top5 = scored.slice(0, 5);

  // Persist matches
  if (top5.length > 0) {
    const matchRows = top5.map((s) => ({
      experiment_id: body.experimentId,
      vendor_id: s.vendor.id,
      match_score: s.score,
      match_reasons: requiredServices,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("vendor_matches")
      .upsert(matchRows, { onConflict: "experiment_id,vendor_id" });
  }

  return NextResponse.json({
    experimentId: body.experimentId,
    hypothesisId: body.hypothesisId,
    matches: top5.map((s) => ({ ...s.vendor, matchScore: +s.score.toFixed(4) })),
    selected: top5[0] ? { ...top5[0].vendor, matchScore: +top5[0].score.toFixed(4) } : null,
    totalVendorsScored: vendors?.length ?? 0,
  });
}
