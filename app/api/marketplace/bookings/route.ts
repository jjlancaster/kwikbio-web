import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db/pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const experimentId = searchParams.get("experimentId");
  const vendorId = searchParams.get("vendorId");

  const conds: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (experimentId) { conds.push(`b.experiment_id=$${i++}`); vals.push(experimentId); }
  if (vendorId)     { conds.push(`b.vendor_id=$${i++}`);     vals.push(vendorId); }

  const sql = `SELECT b.*, v.name as vendor_name, v.slug as vendor_slug,
      l.name as experiment_title
    FROM bookings b
    LEFT JOIN vendors v ON v.id = b.vendor_id
    LEFT JOIN lope_experiments l ON l.id = b.experiment_id
    ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
    ORDER BY b.created_at DESC`;

  try {
    const rows = await query(sql, vals);
    return NextResponse.json({ bookings: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    vendorId?: string | number;
    experimentId?: string | number;
    notes?: string;
  } | null;

  if (!body?.vendorId || !body?.experimentId) {
    return NextResponse.json({ error: "vendorId and experimentId required" }, { status: 400 });
  }

  try {
    const row = await queryOne(
      `INSERT INTO bookings (vendor_id, experiment_id, status, notes)
       VALUES ($1, $2, 'inquiry', $3) RETURNING *`,
      [body.vendorId, body.experimentId, body.notes ?? null],
    );
    return NextResponse.json({ booking: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
