import { NextRequest, NextResponse } from "next/server";
import { analyzeResults } from "@/lib/dae";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    rawResults?: string;
    sessionId?: string;
  } | null;

  const rawResults = (body?.rawResults ?? "").trim();
  if (!rawResults) return NextResponse.json({ error: "rawResults required" }, { status: 400 });

  try {
    const result = await analyzeResults(rawResults, body?.sessionId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
