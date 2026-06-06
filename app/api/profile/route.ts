import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import { kwikbioFetch } from "@/lib/api";

export const runtime = "nodejs";

const VERTICALS = new Set(["Biomedical", "Climate", "Energy"]);

export async function POST(req: Request) {
  // Authenticated route — the SciCrush profile is tied to the user account.
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value ?? "";
  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const passion = String(body?.passion ?? "").trim();
  const education = String(body?.education ?? "").trim();
  const rawYears = body?.experienceYears;
  const experienceYears =
    rawYears === null || rawYears === undefined || rawYears === ""
      ? null
      : Number(rawYears);
  const verticals = Array.isArray(body?.verticals)
    ? (body.verticals as unknown[])
        .map((v) => String(v))
        .filter((v) => VERTICALS.has(v))
    : [];
  const interests = Array.isArray(body?.interests)
    ? (body.interests as unknown[]).map((v) => String(v)).slice(0, 32)
    : [];

  if (!passion) {
    return NextResponse.json(
      { ok: false, error: "passion_required" },
      { status: 400 },
    );
  }
  if (experienceYears !== null && (Number.isNaN(experienceYears) || experienceYears < 0)) {
    return NextResponse.json(
      { ok: false, error: "invalid_experience" },
      { status: 400 },
    );
  }

  const profile = { passion, education, experienceYears, verticals, interests };

  // Forward to the kwikbio API (Jewel :3002), authenticated with the user's JWT.
  // Upstream may be unreachable from Replit dev — surface a clear status so the
  // form can react, but never leak raw upstream errors.
  try {
    const res = await kwikbioFetch("/profile", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "upstream_error" },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "upstream_unreachable" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, profile });
}
