// M-AUTH — Auth.js (NextAuth v5) for kwikbio-web.
//
// Shape deliberately mirrors hydrojoule's portal (same library, same JWT
// strategy, same role-on-token callbacks) so the two apps stay conceptually
// aligned. Two deliberate divergences:
//
//   1. Storage — hydrojoule uses Prisma against its own GCP Postgres.
//      kwikbio-web already runs a `pg` pool against the local Jewel Postgres
//      (`lib/db/pg.ts`), so this uses @auth/pg-adapter on that same pool.
//      Adding a second ORM plus a codegen step to the PM2 deploy buys nothing.
//   2. Secrets — hydrojoule resolves every secret from Google Secret Manager.
//      Jewel has no GCP credentials, so secrets come from the environment.
//      Do not copy `lib/secrets.ts` over; it would drag a cloud dependency
//      onto a box that cannot satisfy it.
//
// FREEMIUM IS NOT GATED. Signing in raises your ceiling; it is never required
// to reach the public knowledge search (R1). See `middleware.ts`.

import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import PostgresAdapter from "@auth/pg-adapter";
import pool from "@/lib/db/pg";
import { query } from "@/lib/db/pg";
import type { AgeBand, Role, Tier } from "./entitlement";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

// Providers are registered only when their credentials are actually present,
// so a partially-configured box (e.g. SMTP not yet provisioned on Jewel) boots
// with the providers it can honour instead of failing closed at startup.
function providers() {
  const list = [];

  const googleId = env("AUTH_GOOGLE_ID");
  const googleSecret = env("AUTH_GOOGLE_SECRET");
  if (googleId && googleSecret) {
    list.push(
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        authorization: {
          params: { prompt: "consent", access_type: "offline", response_type: "code" },
        },
      })
    );
  }

  const host = env("EMAIL_SERVER_HOST");
  const from = env("EMAIL_FROM");
  if (host && from) {
    const user = env("EMAIL_SERVER_USER");
    const pass = env("EMAIL_SERVER_PASSWORD");
    const port = parseInt(env("EMAIL_SERVER_PORT") ?? "587", 10);
    list.push(
      Nodemailer({
        // Credentials are optional: an internal relay on Jewel may accept mail
        // unauthenticated. Simply OMITTING `auth` does not work — Auth.js
        // deep-merges its own provider defaults, which include
        // `auth: { user: "", pass: "" }`, and nodemailer then attempts PLAIN
        // and fails with "Missing credentials for PLAIN". A connection URL
        // replaces the default object outright, so no empty auth survives.
        server: user && pass ? { host, port, auth: { user, pass } } : `smtp://${host}:${port}`,
        from,
      })
    );
  }

  return list;
}

/** The account fields the session needs — read once at sign-in, then cached on the JWT. */
interface AccountRow {
  role: Role;
  tier: Tier;
  age_band: AgeBand | null;
  tou_version: string | null;
  guardian_confirmed_at: Date | null;
}

async function loadAccount(userId: string): Promise<AccountRow | null> {
  const rows = await query<AccountRow>(
    `SELECT role, tier, age_band, tou_version, guardian_confirmed_at
       FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

export const authConfig: NextAuthConfig = {
  adapter: PostgresAdapter(pool),
  providers: providers(),
  session: { strategy: "jwt" },
  pages: { signIn: "/signin", error: "/signin/error" },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // On first sign-in, and whenever the client calls update() (after the
      // consent migration or a tier change), re-read the account so the token
      // never serves a stale entitlement.
      const userId = user?.id ?? (token.sub as string | undefined);
      if (userId && (user || trigger === "update")) {
        const row = await loadAccount(userId);
        token.role = row?.role ?? "SUBSCRIBER";
        token.tier = row?.tier ?? "freemium";
        token.ageBand = row?.age_band ?? null;
        token.touVersion = row?.tou_version ?? null;
        token.guardianConfirmed = row?.guardian_confirmed_at != null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as Role) ?? "SUBSCRIBER";
        session.user.tier = (token.tier as Tier) ?? "freemium";
        session.user.ageBand = (token.ageBand as AgeBand | null) ?? null;
        session.user.touVersion = (token.touVersion as string | null) ?? null;
        session.user.guardianConfirmed = Boolean(token.guardianConfirmed);
      }
      return session;
    },

    async signIn({ user }) {
      return Boolean(user.email);
    },
  },

  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
