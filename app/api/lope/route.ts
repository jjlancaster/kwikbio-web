import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const domain = searchParams.get("domain");
  const status = searchParams.get("status") ?? "available";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("lope_experiments")
    .select("*")
    .order("voi_weight", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (domain) query = query.eq("domain", domain);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ experiments: data ?? [] });
}
