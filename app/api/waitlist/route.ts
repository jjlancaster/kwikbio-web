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

  // Forward to the Express API on Jewel (:3002). It may be unreachable from
  // Replit dev — acknowledge the capture regardless so the UX never breaks.
  try {
    await fetch(`${API_INTERNAL}/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, vertical, source: "kwikbio-web" }),
    }).catch(() => {});
  } catch {
    /* upstream optional in dev */
  }

  return NextResponse.json({ ok: true, email, vertical });
}
