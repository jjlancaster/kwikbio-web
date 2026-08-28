import { NextRequest, NextResponse } from 'next/server';
import { resolvePlayer, guestCookieHeader } from '@/lib/smugglers-run/auth';
import { createMatch } from '@/lib/smugglers-run/store';
import { SKINS, type SkinId, whatsappShareUrl } from '@/lib/smugglers-run/constants';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { skin?: string; name?: string } | null;
  const skin = SKINS.find((s) => s.id === body?.skin)?.id ?? SKINS[0].id;

  const player = await resolvePlayer(req);
  const name = body?.name?.trim().slice(0, 24) || player.name;

  const match = await createMatch(player.id, name, skin as SkinId);
  const origin = req.nextUrl.origin;
  const joinUrl = `${origin}/smugglers-run?join=${match.token}`;

  const res = NextResponse.json({
    token: match.token,
    playerId: player.id,
    joinUrl,
    whatsappUrl: whatsappShareUrl(joinUrl),
    match,
  });
  if (player.newGuestCookie) res.headers.append(...guestCookieHeader(player.newGuestCookie));
  return res;
}
