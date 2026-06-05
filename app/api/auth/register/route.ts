import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kwikbioFetch, extractToken } from "@/lib/api";
import { AUTH_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password, name } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await kwikbioFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: (data as { error?: string })?.error ?? "Registration failed" },
      { status: upstream.status },
    );
  }

  // Some register endpoints return a token (auto-login); others require a
  // separate login. Set the cookie when a token is present.
  const token = extractToken(data);
  if (token) {
    const jar = await cookies();
    jar.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return NextResponse.json({
    ok: true,
    authed: !!token,
    user: (data as { user?: unknown })?.user ?? null,
  });
}
