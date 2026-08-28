// Smuggler's Run v1 — shared tuning constants.
// Spec: brainfiles/specs/SMUGGLERS-RUN-v1-SPEC (Hermes, 2026-07-25).

// World geometry (logical px)
export const VIEW_W = 960;
export const VIEW_H = 540;
export const START_X = 240;            // start line
export const TRACK_LENGTH = 19500;     // start → finish distance
export const FINISH_X = START_X + TRACK_LENGTH;
export const WORLD_W = FINISH_X + 900; // run-off past the finish line

// Two-lane road
export const ROAD_TOP = 396;
export const ROAD_BOTTOM = 530;
export const LANE_CENTERS = [430, 498] as const; // [host, guest]
export const LANE_DRIFT = 24;          // max steer offset within a lane

// Muscle-car physics — one class, all skins share this base.
// 19500px / 600px·s⁻¹ = 32.5s at full throttle → clears the 30s spec floor.
export const MAX_SPEED = 600;          // px/s
export const ACCEL = 300;              // px/s² throttle
export const BRAKE = 520;              // px/s² braking
export const COAST_DRAG = 160;         // px/s² off-throttle
export const STEER_SPEED = 90;         // px/s lateral

// Sand drifts (deterministic per match token — both players see the same road)
export const DRIFTS_PER_LANE = 6;
export const DRIFT_W = 150;
export const DRIFT_SPEED_CAP = 0.45;   // max-speed multiplier while in a drift

export const COUNTDOWN_S = 3;
export const POS_BROADCAST_HZ = 12;
export const RESOLVE_TIMEOUT_MS = 30_000; // opponent no-show after your finish → you win
export const MATCH_TTL_MS = 30 * 60_000;  // ephemeral match records expire

// Skins: 3 variants, same physics base
export const SKINS = [
  { id: 'bandit',  name: 'Bandit',  body: 0xc0392b, stripe: 0xf5e6c8 },
  { id: 'phantom', name: 'Phantom', body: 0x22303f, stripe: 0x9adcf0 },
  { id: 'vulture', name: 'Vulture', body: 0xb8860b, stripe: 0x2c2018 },
] as const;
export type SkinId = (typeof SKINS)[number]['id'];

// Solo mode — computer driver. Same physics base as the player; difficulty is
// a top-speed multiplier, how reliably it dodges sand drifts, and how much
// rubber-banding keeps the race close (0 = no mercy).
export const AI_LEVELS = {
  easy:   { name: 'Easy',   speedMul: 0.82, dodgeSkill: 0.40, rubberBandPx: 500 },
  medium: { name: 'Medium', speedMul: 0.92, dodgeSkill: 0.70, rubberBandPx: 350 },
  hard:   { name: 'Hard',   speedMul: 0.98, dodgeSkill: 0.95, rubberBandPx: 0 },
} as const;
export type AiLevelId = keyof typeof AI_LEVELS;

export function whatsappShareUrl(joinUrl: string): string {
  const msg =
    `🏜️ Smuggler's Run challenge!\n` +
    `Race me through the canyon — first to the drop point wins.\n` +
    `${joinUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

// Small deterministic PRNG so both clients generate an identical track from the token.
export function tokenSeed(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function driftPositions(token: string, lane: number): number[] {
  const rand = mulberry32(tokenSeed(token) ^ (lane * 0x9e3779b9));
  const usable = TRACK_LENGTH * 0.72;
  const first = TRACK_LENGTH * 0.14;
  const slot = usable / DRIFTS_PER_LANE;
  const xs: number[] = [];
  for (let i = 0; i < DRIFTS_PER_LANE; i++) {
    xs.push(START_X + first + slot * i + rand() * (slot - DRIFT_W));
  }
  return xs;
}
