import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const KWIKBIO_API = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

/**
 * POST /api/watch — Register a watch for the authenticated user.
 * Validates Supabase session, forwards to kwikbio-api with x-user-id header.
 * Body: { query_text: string, confidence?: number }
 */
export async function POST(req: NextRequest) {
  // Validate Supabase session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let userId: string | null = null;

  if (supabaseUrl && supabaseServiceKey) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      try {
        const sb = createClient(supabaseUrl, supabaseServiceKey);
        const { data } = await sb.auth.getUser(token);
        userId = data?.user?.id ?? null;
      } catch {
        // ignore Supabase errors — fall through to JWT path
      }
    }
  }

  // Also accept kwikbio JWT in Authorization header (forwarded directly to API)
  const authHeader = req.headers.get("authorization") ?? "";

  const body = await req.json().catch(() => ({})) as { query_text?: string; confidence?: number };

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (userId) {
    headers["x-user-id"] = userId;
  } else if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const res = await fetch(`${KWIKBIO_API}/api/watch`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/watch] upstream error:", err);
    return NextResponse.json({ error: "Watch service unavailable" }, { status: 503 });
  }
}
