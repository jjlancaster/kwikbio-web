import { NextResponse } from "next/server";

  const API_INTERNAL = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

  export async function POST(req: Request) {
    let email = "";
    try {
      const body = await req.json();
      email = String(body?.email ?? "").trim().toLowerCase();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    // Day-3 wiring will call the Express API on Jewel :3002.
    // For Day-1 scaffold we acknowledge and log.
    try {
      await fetch(`${API_INTERNAL}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "kwikbio-web" }),
      }).catch(() => {}); // upstream may not be reachable from Replit dev
    } catch {}

    return NextResponse.json({ ok: true, email });
  }
  