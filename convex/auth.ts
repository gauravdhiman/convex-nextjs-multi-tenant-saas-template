import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          twoFactorEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
    GitHub({
      profile(profile) {
        return {
          email: profile.email,
          name: profile.name,
          image: profile.avatar_url,
          twoFactorEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
    Google({
      profile(profile) {
        return {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          twoFactorEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
  ],
});