import { NextRequest, NextResponse } from "next/server";

// Proxy to the ARS gateway's Navigator data feed (jjlancaster/ars-fs:
// /v1/graph/traverse). The graph lives in the engine, not in kwikbio-web —
// this route just forwards subject + depth and returns the {nodes, edges} feed.
const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";
const TIMEOUT_MS = 6_000;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const subject = (params.get("subject") ?? "").trim();
  if (!subject) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }

  const qs = new URLSearchParams({ subject });
  const level = params.get("level");
  const maxLayer = params.get("max_layer");
  if (maxLayer !== null) qs.set("max_layer", maxLayer);
  else if (level) qs.set("level", level);

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ARS_GATEWAY}/v1/graph/traverse?${qs}`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) {
      // Gateway reachable but errored — surface an honest empty feed, not a fake.
      return NextResponse.json(
        { subject, available: false, nodes: [], edges: [], error: `gateway ${res.status}` },
        { status: 200 },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    clearTimeout(tid);
    // Gateway unreachable (off-Jewel dev) — honest empty feed.
    return NextResponse.json(
      { subject, available: false, nodes: [], edges: [], error: "gateway unreachable" },
      { status: 200 },
    );
  }
}
