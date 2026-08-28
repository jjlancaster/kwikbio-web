import { NextRequest, NextResponse } from 'next/server';
import { resolvePlayer, guestCookieHeader } from '@/lib/smugglers-run/auth';
import { publish } from '@/lib/smugglers-run/bus';

// Upstream gameplay events, fanned out to the match's SSE subscribers.
// 'pos' carries the sender's live position; 'rematch' carries the next match
// token. Lobby-state events are published server-side by the match route, not here.
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    event?: 'pos' | 'rematch';
    x?: number; speed?: number;
    nextToken?: string;
  } | null;
  if (!body?.event) return NextResponse.json({ error: 'event required' }, { status: 400 });

  const player = await resolvePlayer(req);

  if (body.event === 'pos') {
    if (typeof body.x !== 'number' || typeof body.speed !== 'number') {
      return NextResponse.json({ error: 'pos needs x and speed' }, { status: 400 });
    }
    // playerId comes from the session, never from the payload
    publish(token, 'pos', { playerId: player.id, x: body.x, speed: body.speed, t: Date.now() });
  } else if (body.event === 'rematch') {
    if (typeof body.nextToken !== 'string' || body.nextToken.length > 16) {
      return NextResponse.json({ error: 'rematch needs nextToken' }, { status: 400 });
    }
    publish(token, 'rematch', { token: body.nextToken });
  }

  const res = NextResponse.json({ ok: true });
  if (player.newGuestCookie) res.headers.append(...guestCookieHeader(player.newGuestCookie));
  return res;
}
