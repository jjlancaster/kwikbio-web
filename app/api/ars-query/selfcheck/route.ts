import { NextResponse } from "next/server";
import { runProvenanceInvariantChecks } from "@/lib/ars-query";

// GET /api/ars-query/selfcheck — runs the PRISM provenance invariants
// (Amendment §A6.1). 200 if all pass, 500 with the failure list otherwise.
// This is the runnable "definition of done" for the provenance contract.
export async function GET() {
  const result = runProvenanceInvariantChecks();
  return NextResponse.json(result, { status: result.pass ? 200 : 500 });
}
