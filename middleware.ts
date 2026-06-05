import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

// Auth guard for State B (authenticated shell) routes.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  const session = await verifyToken(token);
  if (session) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/g/:path*", "/courses/:path*", "/settings/:path*"],
};
