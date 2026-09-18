// M-AUTH route protection.
//
// THE MATCHER IS THE POLICY. Freemium must stay open (R1): the public
// knowledge search, the navigator, pricing, the blog and the legal pages are
// reachable with no account, exactly like Wikipedia or Google. Only routes
// that are inherently account-scoped appear below. Adding `/navigator` or `/`
// to this matcher would put a login wall on the product's front door — don't.
//
// Edge note: this cannot import `@/lib/auth`, because the pg adapter pulls in
// node-postgres, which does not run on the edge runtime. Reading the JWT
// directly is the supported way to gate in middleware.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROLE_RANK: Record<string, number> = { SUBSCRIBER: 1, RESEARCHER: 2, ADMIN: 3 };

function hasMinRole(role: unknown, required: string): boolean {
  return (ROLE_RANK[String(role)] ?? 0) >= (ROLE_RANK[required] ?? 0);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const signin = () => {
    const url = new URL("/signin", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  };

  if (!token) return signin();

  // /admin/** — staff only. Note this checks `role`, never `tier`: buying the
  // top subscription must not confer administrative access.
  if (pathname.startsWith("/admin") && !hasMinRole(token.role, "ADMIN")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/pod/:path*", "/admin/:path*"],
};
