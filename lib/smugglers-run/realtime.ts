// Browser-side realtime sync: SSE down, fetch POST up. Rides the same Next.js
// process as the rest of the app — no external realtime service, no new port.
// The durable match record only ever changes through the API routes; this
// channel carries gameplay telemetry and nudges.

import type { PosEvent, RematchEvent } from './types';

export interface SrChannelHandlers {
  onPos?: (e: PosEvent) => void;
  onLobbyChange?: () => void;
  onRematch?: (e: RematchEvent) => void;
}

export interface SrChannel {
  live: boolean;
  sendPos: (x: number, speed: number) => void;
  sendRematch: (nextToken: string) => void;
  leave: () => void;
}

export function joinMatchChannel(token: string, h: SrChannelHandlers): SrChannel {
  const es = new EventSource(`/api/smugglers-run/stream/${token}`);
  es.addEventListener('pos', (e) => h.onPos?.(JSON.parse((e as MessageEvent).data) as PosEvent));
  es.addEventListener('lobby', () => h.onLobbyChange?.());
  es.addEventListener('rematch', (e) =>
    h.onRematch?.(JSON.parse((e as MessageEvent).data) as RematchEvent));

  const post = (body: object) => {
    void fetch(`/api/smugglers-run/event/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => { /* telemetry is best-effort; the record API is the truth */ });
  };

  return {
    live: true,
    sendPos: (x, speed) => post({ event: 'pos', x, speed }),
    sendRematch: (nextToken) => post({ event: 'rematch', nextToken }),
    leave: () => es.close(),
  };
}
