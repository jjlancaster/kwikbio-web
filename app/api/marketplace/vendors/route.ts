import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const specialization = searchParams.get("specialization");
  const verifiedOnly = searchParams.get("verified") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const conds: string[] = ["is_active = TRUE"];
  const vals: unknown[] = [];
  let i = 1;
  if (verifiedOnly) { conds.push("is_verified = TRUE"); }
  if (specialization) { conds.push(`$${i++} = ANY(specializations)`); vals.push(specialization); }
  if (search) { conds.push(`(name ILIKE $${i} OR slug ILIKE $${i})`); vals.push(`%${search}%`); i++; }
  vals.push(limit);

  const sql = `SELECT id, name, slug, specializations, trust_score, is_verified,
      avg_turnaround_days, kbkg_node_id, created_at
    FROM vendors WHERE ${conds.join(' AND ')}
    ORDER BY trust_score DESC NULLS LAST LIMIT $${i}`;

  try {
    const rows = await query(sql, vals);
    return NextResponse.json({ vendors: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
