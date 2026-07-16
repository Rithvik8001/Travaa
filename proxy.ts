import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Bounces signed-out traffic off the authed surface (/dashboard, /trips) before it renders.
 *
 * Only the no-cookie direction is decided here. `getSessionCookie` proves a cookie
 * is present, not that it is valid, so trusting it to redirect *into* /dashboard
 * would loop forever against an expired cookie: proxy sends /sign-in -> /dashboard,
 * the page's requireSession() sends /dashboard -> /sign-in. The signed-in redirect
 * lives in the auth pages instead, where the session is actually verified.
 *
 * This runs on prefetches too, so it must never touch the database.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/trips/:path*", "/settings/:path*"],
};
