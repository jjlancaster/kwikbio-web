import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kwikbioFetch, extractToken } from "@/lib/api";
import { AUTH_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await kwikbioFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: (data as { error?: string })?.error ?? "Invalid credentials" },
      { status: upstream.status },
    );
  }

  const token = extractToken(data);
  if (!token) {
    return NextResponse.json({ error: "No token returned by auth service" }, { status: 502 });
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, authed: true, user: (data as { user?: unknown })?.user ?? null });
}
