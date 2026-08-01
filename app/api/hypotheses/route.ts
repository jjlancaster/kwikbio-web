import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db/pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const domain = searchParams.get("domain");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const conds: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (status) { conds.push(`status=$${i++}`); vals.push(status); }
  if (domain) { conds.push(`domain=$${i++}`); vals.push(domain); }
  vals.push(limit);

  const sql = `SELECT * FROM hypotheses${conds.length ? ' WHERE ' + conds.join(' AND ') : ''}
    ORDER BY voi_score DESC NULLS LAST, created_at DESC LIMIT $${i}`;

  try {
    const rows = await query(sql, vals);
    return NextResponse.json({ hypotheses: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    title?: string;
    description?: string;
    domain?: string;
    confidence?: number;
    relevance?: number;
  } | null;

  if (!body?.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const row = await queryOne(
      `INSERT INTO hypotheses (title, text, domain, confidence, relevance, voi_score, congruence, status)
       VALUES ($1, $2, $3, $4, $5, 0, 0, 'proposed') RETURNING *`,
      [
        body.title,
        body.description ?? body.title,
        body.domain ?? "general",
        body.confidence ?? 0.5,
        body.relevance ?? 0.5,
      ],
    );
    return NextResponse.json({ hypothesis: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
