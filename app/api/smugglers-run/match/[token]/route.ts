import { NextRequest, NextResponse } from 'next/server';
import { resolvePlayer, guestCookieHeader, type PlayerIdentity } from '@/lib/smugglers-run/auth';
import { getMatch, saveMatch, resolveResult, defaultGuestSkin } from '@/lib/smugglers-run/store';
import { writeRaceToGraph } from '@/lib/smugglers-run/graph';
import { publish } from '@/lib/smugglers-run/bus';
import { RESOLVE_TIMEOUT_MS, SKINS, type SkinId } from '@/lib/smugglers-run/constants';
import type { MatchRecord } from '@/lib/smugglers-run/types';

type Ctx = { params: Promise<{ token: string }> };

function withCookie(res: NextResponse, p: PlayerIdentity): NextResponse {
  if (p.newGuestCookie) res.headers.append(...guestCookieHeader(p.newGuestCookie));
  return res;
}

// One finisher + opponent silent past the grace window → finisher wins by timeout.
async function maybeTimeoutResolve(m: MatchRecord): Promise<void> {
  if (m.status !== 'racing' || !m.startedAt || !m.guest) return;
  const startWall = Date.parse(m.startedAt);
  const players = [m.host, m.guest];
  const done = players.find((p) => p.finishMs !== null);
  const pending = players.find((p) => p.finishMs === null);
  if (!done || !pending) return;
  if (Date.now() > startWall + done.finishMs! + RESOLVE_TIMEOUT_MS) {
    m.result = {
      winnerId: done.id,
      loserId: pending.id,
      deltaMs: -1,
      decidedBy: 'timeout',
      recordedAt: new Date().toISOString(),
    };
    m.status = 'finished';
    await saveMatch(m);
    publish(m.token, 'lobby', {});
    await writeRaceToGraph(m).catch((e) => console.error('[sr] graph write failed:', e));
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const player = await resolvePlayer(req);
  const match = await getMatch(token);
  if (!match) return NextResponse.json({ error: 'match not found' }, { status: 404 });
  await maybeTimeoutResolve(match);
  return withCookie(NextResponse.json({ match, playerId: player.id }), player);
}

// Every successful state change fans out a 'lobby' nudge so SSE subscribers
// re-fetch immediately instead of waiting for their poll tick.
export async function POST(req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    action?: 'join' | 'skin' | 'ready' | 'start' | 'finish';
    skin?: string;
    name?: string;
    ready?: boolean;
    timeMs?: number;
  } | null;
  if (!body?.action) return NextResponse.json({ error: 'action required' }, { status: 400 });

  const player = await resolvePlayer(req);
  const match = await getMatch(token);
  if (!match) return NextResponse.json({ error: 'match not found' }, { status: 404 });
  if (match.status === 'expired') {
    return NextResponse.json({ error: 'match expired' }, { status: 410 });
  }

  const isHost = match.host.id === player.id;
  const isGuest = match.guest?.id === player.id;
  const fail = (msg: string, status = 400) =>
    withCookie(NextResponse.json({ error: msg }, { status }), player);

  switch (body.action) {
    case 'join': {
      if (isHost) break; // host opening their own link — just return state
      if (match.guest && !isGuest) return fail('race already has two smugglers', 409);
      if (!match.guest) {
        match.guest = {
          id: player.id,
          name: body.name?.trim().slice(0, 24) || player.name,
          skin: defaultGuestSkin(match.host.skin),
          ready: false,
          finishMs: null,
        };
        match.status = 'lobby';
        await saveMatch(match);
      }
      break;
    }
    case 'skin': {
      const skin = SKINS.find((s) => s.id === body.skin)?.id as SkinId | undefined;
      if (!skin) return fail('unknown skin');
      if (match.status !== 'open' && match.status !== 'lobby') return fail('skins lock at race start');
      if (isHost) match.host.skin = skin;
      else if (isGuest) match.guest!.skin = skin;
      else return fail('not in this match', 403);
      await saveMatch(match);
      break;
    }
    case 'ready': {
      if (match.status !== 'lobby') return fail('both players must be in the lobby');
      if (isHost) match.host.ready = body.ready ?? true;
      else if (isGuest) match.guest!.ready = body.ready ?? true;
      else return fail('not in this match', 403);
      await saveMatch(match);
      break;
    }
    case 'start': {
      // Host is the start authority once both sides confirmed READY.
      if (!isHost) return fail('only the host starts the race', 403);
      if (!match.guest || !match.host.ready || !match.guest.ready) {
        return fail('both players must be READY');
      }
      if (match.status === 'lobby') {
        match.status = 'racing';
        match.startedAt = new Date().toISOString();
        await saveMatch(match);
      }
      break;
    }
    case 'finish': {
      if (match.status !== 'racing') return fail('race is not running');
      if (typeof body.timeMs !== 'number' || body.timeMs < 1000) return fail('bad finish time');
      if (isHost) match.host.finishMs = Math.round(body.timeMs);
      else if (isGuest) match.guest!.finishMs = Math.round(body.timeMs);
      else return fail('not in this match', 403);

      const result = resolveResult(match);
      if (result) {
        match.result = result;
        match.status = 'finished';
      }
      await saveMatch(match);
      if (result) {
        await writeRaceToGraph(match).catch((e) => console.error('[sr] graph write failed:', e));
      }
      break;
    }
  }

  await maybeTimeoutResolve(match);
  publish(match.token, 'lobby', {});
  return withCookie(NextResponse.json({ match, playerId: player.id }), player);
}
