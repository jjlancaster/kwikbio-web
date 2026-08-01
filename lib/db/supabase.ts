// DEPRECATED — Supabase removed 2026-08-01.
// All DB access now goes through lib/db/pg.ts (local Postgres on Jewel).
// This stub exists only to prevent any lingering import from breaking the build.

export const supabase = null;
export function getSupabase() { throw new Error("Supabase removed — use lib/db/pg.ts"); }
