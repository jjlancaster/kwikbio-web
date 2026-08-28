// Ephemeral match records keyed to the challenge token.
// Primary store: sr_matches on Jewel's local Postgres (db/smugglers-run.sql).
// If Postgres is unreachable (off-Jewel dev) the store falls back to an
// in-process map for the life of the process — fine for one Next.js instance.

import { randomBytes } from 'crypto';
import { query, queryOne } from '../db/pg';
import { MATCH_TTL_MS, SKINS, type SkinId } from './constants';
import type { MatchRecord, MatchResult } from './types';

const g = globalThis as unknown as { __srMatches?: Map<string, MatchRecord>; __srPgDown?: boolean };
const mem = (g.__srMatches ??= new Map<string, MatchRecord>());

function pgDown(): boolean { return g.__srPgDown === true; }
function markPgDown(err: unknown): void {
  if (!g.__srPgDown) {
    g.__srPgDown = true;
    console.warn('[sr] Postgres unreachable — falling back to in-memory match store:',
      err instanceof Error ? err.message : err);
  }
}

export function newToken(): string {
  // 8 chars, unambiguous alphabet — survives being retyped from a WhatsApp message
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function isExpired(m: MatchRecord): boolean {
  return Date.now() - Date.parse(m.createdAt) > MATCH_TTL_MS && m.status !== 'finished';
}

export async function createMatch(hostId: string, hostName: string, skin: SkinId): Promise<MatchRecord> {
  const match: MatchRecord = {
    token: newToken(),
    status: 'open',
    host: { id: hostId, name: hostName, skin, ready: false, finishMs: null },
    guest: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    result: null,
  };
  await saveMatch(match);
  return match;
}

export async function getMatch(token: string): Promise<MatchRecord | null> {
  let m: MatchRecord | null = null;
  if (!pgDown()) {
    try {
      const row = await queryOne<{ data: MatchRecord }>(
        'SELECT data FROM sr_matches WHERE token = $1', [token],
      );
      m = row?.data ?? null;
    } catch (err) {
      markPgDown(err);
    }
  }
  if (pgDown()) m = mem.get(token) ?? null;

  if (m && isExpired(m) && m.status !== 'expired') {
    m.status = 'expired';
    await saveMatch(m);
  }
  return m;
}

export async function saveMatch(m: MatchRecord): Promise<void> {
  if (!pgDown()) {
    try {
      await query(
        `INSERT INTO sr_matches (token, status, data, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (token) DO UPDATE SET status = $2, data = $3, updated_at = NOW()`,
        [m.token, m.status, JSON.stringify(m)],
      );
      return;
    } catch (err) {
      markPgDown(err);
    }
  }
  mem.set(m.token, m);
}

export function defaultGuestSkin(hostSkin: SkinId): SkinId {
  return SKINS.find((s) => s.id !== hostSkin)!.id;
}

export function resolveResult(m: MatchRecord): MatchResult | null {
  if (!m.guest) return null;
  const h = m.host.finishMs;
  const gms = m.guest.finishMs;
  if (h !== null && gms !== null) {
    const hostWins = h <= gms;
    return {
      winnerId: hostWins ? m.host.id : m.guest.id,
      loserId: hostWins ? m.guest.id : m.host.id,
      deltaMs: Math.abs(h - gms),
      decidedBy: 'finish',
      recordedAt: new Date().toISOString(),
    };
  }
  return null;
}
