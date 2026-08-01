import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const KWIKBIO_API = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

/**
 * GET /api/watches — List watches for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let userId: string | null = null;
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (supabaseUrl && supabaseServiceKey && token) {
    try {
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await sb.auth.getUser(token);
      userId = data?.user?.id ?? null;
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  } else if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const res = await fetch(`${KWIKBIO_API}/api/watches`, { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/watches] upstream error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}

/**
 * DELETE /api/watches?id=123 — Remove a specific watch.
 */
export async function DELETE(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let userId: string | null = null;
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (supabaseUrl && supabaseServiceKey && token) {
    try {
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await sb.auth.getUser(token);
      userId = data?.user?.id ?? null;
    } catch { /* ignore */ }
  }

  const headers: Record<string, string> = {};
  if (userId) headers["x-user-id"] = userId;
  else if (authHeader) headers["authorization"] = authHeader;
  else return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const res = await fetch(`${KWIKBIO_API}/api/watches/${id}`, { method: "DELETE", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/watches] DELETE upstream error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}
