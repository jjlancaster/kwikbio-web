# Smuggler's Run — v1.1

Two-player browser racing game plus solo modes. Desert canyon, two-lane road,
one race per session, WhatsApp deep-link challenge flow. Spec: Hermes,
2026-07-25 (SEED); solo mode added on Justin's 2026-08-28 request.

## How it fits together

| Piece | Where | Notes |
|-------|-------|-------|
| Game page | `app/smugglers-run/page.tsx` | `/smugglers-run`, `?join=<token>` deep-link entry |
| App shell | `app/smugglers-run/SmugglersRunApp.tsx` | landing → lobby/solo → race → result state machine |
| Phaser scene | `app/smugglers-run/game/RaceScene.ts` | arcade physics, procedural art, computer driver |
| Match APIs | `app/api/smugglers-run/*` | challenge create, join/skin/ready/start/finish |
| Realtime | `bus.ts` + `stream/[token]` + `event/[token]` | in-process pub/sub → SSE down, POST up |
| Match store | `lib/smugglers-run/store.ts` | `sr_matches` on local Postgres (`db/smugglers-run.sql`); in-memory fallback off-Jewel |
| Graph writes | `lib/smugglers-run/graph.ts` | `gs_nodes` race node + `COMPETED_IN` edges in `gs_edges` |
| Identity | `lib/smugglers-run/auth.ts` | guest cookie; single seam to swap when a session layer returns |

## Modes

- **Challenge a Friend** — the spec'd two-player flow: token → WhatsApp deep-link →
  lobby (skins + READY) → race → result → rematch. Recorded to the Jewel graph.
- **Race the Computer** — solo vs. a simulated driver on the same physics base.
  Easy / Medium / Hard set its top speed (82% / 92% / 98%), drift-dodge skill
  (40% / 70% / 95%), and rubber-banding (easy and medium stay close; hard never
  waits). Deterministic per run token. Not recorded.
- **Test Drive** — empty canyon, just you and the clock. Not recorded.

## Race design

- Side-scrolling canyon, parallax mesa sky (3 layers), two-lane road.
- Muscle-car class only; 3 skins (Bandit / Phantom / Vulture) share one physics base.
- 19,500 px at 600 px/s top speed → 32.5 s minimum at full throttle (spec floor: 30 s).
- Sand drifts (seeded from the match token, identical for both players) cap speed
  at 45% while crossed — steer within your lane to dodge them.
- Controls: W/↑ throttle+steer-up, S/↓ brake/steer-down, D/→/Space throttle,
  A/← brake. Touch: hold to throttle, upper/lower half steers.

## Ops

- Run `db/smugglers-run.sql` once on Jewel's local Postgres (same DB as
  `db/schema.sql`; connection via `PG_*` env vars, see `lib/db/pg.ts`).
- Realtime is served by the app itself (SSE) — single-process assumption, which
  matches the PM2 deploy. No new port, no external service.
- Without Postgres reachable the store falls back to in-memory matches and graph
  writes are skipped — the game stays fully playable for local dev.

## v1 non-goals (per spec)

More than 2 players, leaderboards, power-ups.
