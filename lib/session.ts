import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** Cached per render pass, so several callers in one page cost one lookup. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * The real auth boundary — proxy.ts only checks that a cookie exists.
 * Anything reading user data should go through this.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/**
 * Keeps signed-in users off the auth pages. Verifies the session rather than
 * trusting the cookie, so a stale cookie still renders the form instead of
 * ping-ponging against requireSession().
 */
export async function redirectIfSignedIn() {
  if (await getSession()) redirect("/dashboard");
}
