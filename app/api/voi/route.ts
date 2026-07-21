import { NextRequest, NextResponse } from "next/server";
import { calculateVOI } from "@/lib/voi";
import type { VOIInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as VOIInput | null;

  if (!body?.hypothesis || !body?.experiment) {
    return NextResponse.json(
      { error: "hypothesis and experiment objects required" },
      { status: 400 }
    );
  }

  try {
    const result = calculateVOI(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
