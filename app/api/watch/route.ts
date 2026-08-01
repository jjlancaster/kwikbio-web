import { NextRequest, NextResponse } from "next/server";

const KWIKBIO_API = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

/**
 * POST /api/watch — Register a watch for the authenticated user.
 * Forwards Authorization header directly to kwikbio-api (JWT).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { query_text?: string; confidence?: number };

  try {
    const res = await fetch(`${KWIKBIO_API}/api/watch`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/watch] upstream error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}
