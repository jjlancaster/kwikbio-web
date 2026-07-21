import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const specialization = searchParams.get("specialization");
  const verifiedOnly = searchParams.get("verified") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("vendors")
    .select("id, name, slug, specializations, trust_score, is_verified, avg_turnaround_days, kbkg_node_id, created_at")
    .order("trust_score", { ascending: false })
    .limit(limit);

  if (verifiedOnly) query = query.eq("is_verified", true);
  if (specialization) query = query.contains("specializations", [specialization]);
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendors: data ?? [] });
}
