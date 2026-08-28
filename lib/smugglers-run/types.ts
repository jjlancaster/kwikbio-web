import type { SkinId } from './constants';

export type MatchStatus = 'open' | 'lobby' | 'racing' | 'finished' | 'expired';

export interface MatchPlayer {
  id: string;
  name: string;
  skin: SkinId;
  ready: boolean;
  finishMs: number | null;
}

export interface MatchResult {
  winnerId: string;
  loserId: string;
  deltaMs: number;      // winner margin; -1 when decided by no-show/disconnect
  decidedBy: 'finish' | 'timeout';
  recordedAt: string;
}

export interface MatchRecord {
  token: string;
  status: MatchStatus;
  host: MatchPlayer;
  guest: MatchPlayer | null;
  createdAt: string;
  startedAt: string | null; // server time when host fired race start
  result: MatchResult | null;
}

/** Realtime payloads carried over the match SSE stream (lib/smugglers-run/bus.ts). */
export interface PosEvent   { playerId: string; x: number; speed: number; t: number }
export interface RematchEvent { token: string }
