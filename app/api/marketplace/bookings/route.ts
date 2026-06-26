import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const experimentId = searchParams.get("experimentId");
  const vendorId = searchParams.get("vendorId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("bookings")
    .select("*, vendors(name, slug), lope_experiments(title)")
    .order("booked_at", { ascending: false });

  if (experimentId) query = query.eq("experiment_id", experimentId);
  if (vendorId) query = query.eq("vendor_id", vendorId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    vendorId?: string;
    experimentId?: string;
    notes?: string;
  } | null;

  if (!body?.vendorId || !body?.experimentId) {
    return NextResponse.json(
      { error: "vendorId and experimentId required" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("bookings")
    .insert({
      vendor_id: body.vendorId,
      experiment_id: body.experimentId,
      status: "pending",
      notes: body.notes ?? null,
      booked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data }, { status: 201 });
}
