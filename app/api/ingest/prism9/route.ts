import { NextRequest, NextResponse } from "next/server";

const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") ?? "").trim();

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    const resp = await fetch(
      `${ARS_GATEWAY}/v1/prism9?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (resp.ok) {
      const data = await resp.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { error: "ARS Gateway returned error", upstream_status: resp.status },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { error: "ARS Gateway unreachable", query, nodes: [], edges: [], fallback: true },
      { status: 503 }
    );
  }
}
