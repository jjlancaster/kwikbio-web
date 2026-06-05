// Server-side proxy helper to the existing kwikbio API (Jewel loopback, port 3002).
const BASE = process.env.KWIKBIO_API_INTERNAL ?? "http://127.0.0.1:3002";

export function kwikbioFetch(path: string, init?: RequestInit) {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

// Best-effort extraction of a JWT from varying kwikbio API response shapes.
export function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const candidates = [d.token, d.accessToken, d.access_token, d.jwt];
  for (const c of candidates) if (typeof c === "string" && c.length > 0) return c;
  const nested = d.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    for (const c of [n.token, n.accessToken, n.access_token, n.jwt])
      if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}
