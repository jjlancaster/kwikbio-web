import { NextRequest, NextResponse } from "next/server";
import { resolveQuery } from "@/lib/ars-query";
import type { Level, RequestedArtifact } from "@/lib/ars-query";

// POST /api/ars-query/resolve  — Query Manager entry (spec §3.5).
// Body: { query, subject?, level?, current_focus?, confidence_floor?, requested? }
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

  const result = await resolveQuery({
    query: body.query,
    subject: body.subject,
    level: body.level ?? "beginner",
    currentFocus: body.current_focus,
    confidenceFloor: body.confidence_floor,
    requested: body.requested,
  });

  return NextResponse.json(result);
}
