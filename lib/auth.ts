import { jwtVerify, decodeJwt, type JWTPayload } from "jose";

export const AUTH_COOKIE = "kb_token";

function secretKey(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  return s ? new TextEncoder().encode(s) : null;
}

/**
 * Verify a kwikbio JWT.
 * - When JWT_SECRET is set (production / shared with the kwikbio API), the
 *   signature is fully verified.
 * - When JWT_SECRET is absent, the token is NOT trusted unless we are running
 *   in local development. Outside development we hard-fail (return null) so a
 *   misconfigured deploy can never accept forged, unsigned tokens. On Jewel,
 *   JWT_SECRET must be set.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) return null;
  const key = secretKey();
  try {
    if (key) {
      const { payload } = await jwtVerify(token, key);
      return payload;
    }
    // No JWT_SECRET: signatures cannot be verified. Only allow a decode-only
    // fallback in local development; treat everything else as unauthenticated.
    if (process.env.NODE_ENV !== "development") return null;
    const payload = decodeJwt(token);
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
