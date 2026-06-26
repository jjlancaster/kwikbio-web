import { NextRequest, NextResponse } from "next/server";
import { runSLAM } from "@/lib/slam";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { query?: string; domain?: string };
  const query = (body.query ?? "").trim();
  const domain = body.domain ?? "general";

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    const result = await runSLAM(query, domain);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
