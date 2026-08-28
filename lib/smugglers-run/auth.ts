// Player identity for Smuggler's Run.
// The Supabase session layer was removed 2026-08-01 (see lib/db/supabase.ts stub);
// until Jewel grows a replacement session layer, identity is an httpOnly guest
// cookie minted on first contact. When real auth lands, resolvePlayer is the
// single seam to swap.

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export const GUEST_COOKIE = 'sr_pid';

export interface PlayerIdentity {
  id: string;
  name: string;
  isGuest: boolean;
  /** Set when a fresh guest id was minted — caller must attach it to the response. */
  newGuestCookie?: string;
}

function guestName(id: string): string {
  return `Smuggler-${id.slice(0, 4).toUpperCase()}`;
}

export async function resolvePlayer(req: NextRequest): Promise<PlayerIdentity> {
  const existing = req.cookies.get(GUEST_COOKIE)?.value;
  if (existing) return { id: existing, name: guestName(existing), isGuest: true };

  const id = randomUUID();
  return { id, name: guestName(id), isGuest: true, newGuestCookie: id };
}

export function guestCookieHeader(id: string): [string, string] {
  return [
    'Set-Cookie',
    `${GUEST_COOKIE}=${id}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`,
  ];
}
