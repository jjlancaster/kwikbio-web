// D-AUTH-4 — move R2 consent from localStorage onto the account record.
//
// Before accounts existed, ToU acceptance and age band lived in localStorage.
// That is a value the visitor can edit, and it cannot gate anything that costs
// money. Once signed in, the ACCOUNT RECORD IS AUTHORITATIVE and the browser
// copy is only a cache.
//
// Direction of authority on first sign-in:
//   • account already has a value  → server wins, client adopts it
//   • account is blank, client has → migrate up, logged as 'migrated-local'
//   • neither                      → the gates ask again, on the server's terms
//
// HONESTY: migrating an age band records a SELF-ASSERTION with an audit trail.
// It does not verify anyone's age. Real verification is Terms §16, unwritten.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db/pg";

export const runtime = "nodejs";

type AgeBand = "adult" | "minor";

interface AccountConsent {
  tou_version: string | null;
  tou_accepted_at: Date | null;
  age_band: AgeBand | null;
  guardian_confirmed_at: Date | null;
}

async function readConsent(userId: string): Promise<AccountConsent | null> {
  return queryOne<AccountConsent>(
    `SELECT tou_version, tou_accepted_at, age_band, guardian_confirmed_at
       FROM users WHERE id = $1`,
    [userId]
  );
}

/** GET — what the account says. The client renders this, not its own copy. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }
  const row = await readConsent(session.user.id);
  return NextResponse.json({
    touVersion: row?.tou_version ?? null,
    ageBand: row?.age_band ?? null,
    guardianConfirmed: row?.guardian_confirmed_at != null,
  });
}

/**
 * POST { touVersion?, ageBand?, migrated? } — record consent on the account.
 *
 * `migrated: true` marks a one-time lift of pre-account localStorage values and
 * is applied ONLY to fields the account has not already answered, so a stale
 * browser can never overwrite a real acceptance.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { touVersion?: unknown; ageBand?: unknown; migrated?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const touVersion =
    typeof body.touVersion === "string" && body.touVersion.trim() !== ""
      ? body.touVersion.trim()
      : null;
  const ageBand =
    body.ageBand === "adult" || body.ageBand === "minor" ? (body.ageBand as AgeBand) : null;
  const migrated = body.migrated === true;
  const source = migrated ? "migrated-local" : "web";

  if (!touVersion && !ageBand) {
    return NextResponse.json({ error: "nothing to record" }, { status: 400 });
  }

  const existing = await readConsent(userId);

  // A migration never overwrites an answer the account already holds.
  const writeTou = touVersion && !(migrated && existing?.tou_version);
  const writeAge = ageBand && !(migrated && existing?.age_band);

  if (writeTou) {
    await query(
      `UPDATE users SET tou_version = $2, tou_accepted_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
      [userId, touVersion]
    );
    await query(
      `INSERT INTO consent_events (user_id, kind, value, source) VALUES ($1, 'tou', $2, $3)`,
      [userId, touVersion, source]
    );
  }

  if (writeAge) {
    await query(
      `UPDATE users SET age_band = $2, age_confirmed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
      [userId, ageBand]
    );
    await query(
      `INSERT INTO consent_events (user_id, kind, value, source) VALUES ($1, 'age', $2, $3)`,
      [userId, ageBand, source]
    );
  }

  const row = await readConsent(userId);
  return NextResponse.json({
    touVersion: row?.tou_version ?? null,
    ageBand: row?.age_band ?? null,
    guardianConfirmed: row?.guardian_confirmed_at != null,
  });
}
