import { NextResponse } from "next/server";

  export async function GET() {
    return NextResponse.json({
      ok: true,
      service: "kwikbio-web",
      version: "0.1.0",
      ts: new Date().toISOString(),
    });
  }
  