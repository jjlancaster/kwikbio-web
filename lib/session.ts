import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

export type Session = {
  email: string | null;
  name: string | null;
  token: string;
};

/**
 * Server-only: read and verify the current kwikbio session from the httpOnly
 * cookie. Returns null when unauthenticated. Use in (shell) server components.
 */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value ?? "";
  const payload = await verifyToken(token);
  if (!payload) return null;

  const email =
    (typeof payload.email === "string" && payload.email) ||
    (typeof payload.sub === "string" && payload.sub) ||
    null;
  const name =
    (typeof payload.name === "string" && payload.name) ||
    (email ? email.split("@")[0] : null);

  return { email, name, token };
}
