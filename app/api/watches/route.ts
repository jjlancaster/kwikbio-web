import { NextRequest, NextResponse } from "next/server";

const KWIKBIO_API = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

function authHeaders(req: NextRequest): Record<string, string> | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth) return null;
  return { authorization: auth };
}

export async function GET(req: NextRequest) {
  const headers = authHeaders(req);
  if (!headers) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const res = await fetch(`${KWIKBIO_API}/api/watches`, { headers });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    console.error("[api/watches] GET error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const headers = authHeaders(req);
  if (!headers) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const res = await fetch(`${KWIKBIO_API}/api/watches/${id}`, { method: "DELETE", headers });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    console.error("[api/watches] DELETE error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}
