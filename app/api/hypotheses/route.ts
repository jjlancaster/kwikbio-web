import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const domain = searchParams.get("domain");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("hypotheses")
    .select("*")
    .order("voi_score", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (domain) query = query.eq("domain", domain);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hypotheses: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    title?: string;
    description?: string;
    domain?: string;
    confidence?: number;
    relevance?: number;
  } | null;

  if (!body?.title || !body?.description) {
    return NextResponse.json({ error: "title and description required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("hypotheses")
    .insert({
      title: body.title,
      description: body.description,
      domain: body.domain ?? "general",
      confidence: body.confidence ?? 0.5,
      relevance: body.relevance ?? 0.5,
      voi_score: 0,
      congruence: 0,
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hypothesis: data }, { status: 201 });
}
