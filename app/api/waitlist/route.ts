import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_INTERNAL =
  process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";
const VERTICALS = new Set(["climate", "energy"]);

export async function POST(req: Request) {
  let email = "";
  let vertical = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
    vertical = String(body?.vertical ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!VERTICALS.has(vertical)) {
    return NextResponse.json({ ok: false, error: "invalid_vertical" }, { status: 400 });
  }

  // Forward to the Express API on Jewel (:3002), truly fire-and-forget: do NOT
  // await it, so response latency is never coupled to upstream. A short abort
  // timeout keeps the dangling socket from lingering on the long-lived PM2
  // process. Errors are swallowed — the capture is acknowledged regardless so
  // the UX never breaks. (kwikbio-web runs as a persistent Node server, not a
  // serverless function, so the un-awaited request completes after we respond.)
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 5_000);
  fetch(`${API_INTERNAL}/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, vertical, source: "kwikbio-web" }),
    signal: ac.signal,
  })
    .catch(() => {})
    .finally(() => clearTimeout(timeout));

  return NextResponse.json({ ok: true, email, vertical });
}
