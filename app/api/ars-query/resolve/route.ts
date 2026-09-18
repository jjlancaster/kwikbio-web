import { NextRequest, NextResponse } from "next/server";
import { resolveQuery } from "@/lib/ars-query";
import type { Level, RequestedArtifact } from "@/lib/ars-query";
import { auth } from "@/lib/auth";
import { LEVEL_RANK, maxLevelFor } from "@/lib/auth/entitlement";

// The pg-backed session lookup is not edge-compatible.
export const runtime = "nodejs";

// POST /api/ars-query/resolve  — Query Manager entry (spec §3.5).
// Body: { query, subject?, level?, current_focus?, confidence_floor?, requested? }
//
// ENTITLEMENT IS ENFORCED HERE, not in the browser. The Level badge and the
// locked-depth teaser are affordances; this route is the control. A client can
// always post `level: "pro"` by hand, so the requested Level is CLAMPED to the
// caller's entitlement before it reaches the Query Manager — which matters
// because Level is a plan-time depth bound (spec §3.4), not a display filter,
// so an unclamped Level really would execute and return the deeper graph.
//
// Freemium stays open: an anonymous caller is not rejected, just held at Easy.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    query?: string;
    subject?: string;
    level?: Level;
    current_focus?: string;
    confidence_floor?: number;
    requested?: RequestedArtifact[];
  };

  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "query (string) is required" }, { status: 400 });
  }

  const session = await auth().catch(() => null);
  const ceiling = maxLevelFor(
    session?.user
      ? {
          tier: session.user.tier,
          ageBand: session.user.ageBand,
          guardianConfirmed: session.user.guardianConfirmed,
        }
      : null
  );

  const requestedLevel: Level = body.level ?? "beginner";
  const clamped = LEVEL_RANK[requestedLevel] > LEVEL_RANK[ceiling];
  const level: Level = clamped ? ceiling : requestedLevel;

  const result = await resolveQuery({
    query: body.query,
    subject: body.subject,
    level,
    currentFocus: body.current_focus,
    confidenceFloor: body.confidence_floor,
    requested: body.requested,
  });

  // Tell the client the truth about what it got, so the UI can show the
  // upgrade path instead of silently rendering a shallower graph than asked.
  return NextResponse.json(
    clamped
      ? { ...result, entitlementClamped: true, requestedLevel, entitledLevel: ceiling }
      : result
  );
}
