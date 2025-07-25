import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Password<DataModel>({
            profile(params) {
                const firstName = params.firstName as string;
                const lastName = params.lastName as string;
                const fullName = `${firstName} ${lastName}`.trim();

                return {
                    email: params.email as string,
                    name: fullName,
                    firstName: firstName,
                    lastName: lastName,
                    // Required system fields
                    isActive: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
            },
        }),
        Google
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, type }) {
            // Only run this for new user signups, not existing user logins
            if (existingUserId === null && type === "credentials") {
                // System fields are already set in the profile function
                // Organization creation will be handled separately in the setup page
            }
        },
    },
});