import { NextResponse } from "next/server";
  import pkg from "@/package.json";

  export async function GET() {
    return NextResponse.json({
      ok: true,
      service: "kwikbio-web",
      version: pkg.version,
      ts: new Date().toISOString(),
    });
  }
  