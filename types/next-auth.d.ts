import type { AgeBand, Role, Tier } from "@/lib/auth/entitlement";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Staff RBAC — not a product entitlement. */
      role: Role;
      /** Consumer entitlement tier — governs Level depth. */
      tier: Tier;
      ageBand: AgeBand | null;
      touVersion: string | null;
      guardianConfirmed: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    tier?: Tier;
    ageBand?: AgeBand | null;
    touVersion?: string | null;
    guardianConfirmed?: boolean;
  }
}

export {};
