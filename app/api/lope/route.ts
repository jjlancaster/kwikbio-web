import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const domain = searchParams.get("domain");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const conds: string[] = ["is_active = TRUE"];
  const vals: unknown[] = [];
  let i = 1;
  if (domain) { conds.push(`domain=$${i++}`); vals.push(domain); }
  if (search) { conds.push(`name ILIKE $${i++}`); vals.push(`%${search}%`); }
  vals.push(limit);

  const sql = `SELECT * FROM lope_experiments WHERE ${conds.join(' AND ')}
    ORDER BY voi_weight DESC NULLS LAST, created_at DESC LIMIT $${i}`;

  try {
    const rows = await query(sql, vals);
    return NextResponse.json({ experiments: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
