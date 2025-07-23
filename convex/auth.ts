import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { GoogleOAuth } from "@convex-dev/auth/providers/GoogleOAuth";
import { GitHubOAuth } from "@convex-dev/auth/providers/GitHubOAuth";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
    GoogleOAuth,
    GitHubOAuth,
  ],
});