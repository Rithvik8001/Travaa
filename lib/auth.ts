import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import { db } from "@/lib/db";

export const auth = betterAuth({
  appName: "Travaa",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  plugins: [
    username({ minUsernameLength: 3, maxUsernameLength: 24 }),
    // Lifts Set-Cookie onto Next's cookie store. Must stay last in the array.
    nextCookies(),
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
