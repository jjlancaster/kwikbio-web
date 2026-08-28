// In-process pub/sub for match events, feeding the SSE stream route.
// kwikbio-web runs as a single Node process on Jewel (PM2), so an in-memory
// bus is sufficient — no extra WS server, no extra port. If the app ever goes
// multi-instance, swap this for Postgres LISTEN/NOTIFY behind the same API.

export type BusListener = (event: string, payload: unknown) => void;

const g = globalThis as unknown as { __srBus?: Map<string, Set<BusListener>> };
const bus = (g.__srBus ??= new Map<string, Set<BusListener>>());

export function publish(token: string, event: string, payload: unknown): void {
  const set = bus.get(token);
  if (!set) return;
  for (const fn of set) {
    try { fn(event, payload); } catch { /* one dead listener must not break the rest */ }
  }
}

export function subscribe(token: string, fn: BusListener): () => void {
  let set = bus.get(token);
  if (!set) { set = new Set(); bus.set(token, set); }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) bus.delete(token);
  };
}
