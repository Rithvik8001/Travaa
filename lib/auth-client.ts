import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** usernameClient is what types `username` onto signUp.email, even though sign-in is email-only. */
export const authClient = createAuthClient({
  plugins: [usernameClient()],
});

export const { signIn, signUp, signOut, updateUser, useSession } = authClient;
