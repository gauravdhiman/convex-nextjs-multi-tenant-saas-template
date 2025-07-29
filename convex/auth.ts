import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import LinkedIn from "@auth/core/providers/linkedin";
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
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        LinkedIn({
            clientId: process.env.AUTH_LINKEDIN_ID,
            clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        })
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, type }) {
            // Ensure required fields are set for new users
            if (existingUserId === null) {
                const user = await ctx.db.get(userId);
                if (user && (!user.isActive || !user.createdAt || !user.updatedAt)) {
                    await ctx.db.patch(userId, {
                        isActive: user.isActive ?? true,
                        createdAt: user.createdAt ?? Date.now(),
                        updatedAt: Date.now(),
                    });
                }
            }
        },
    },
});