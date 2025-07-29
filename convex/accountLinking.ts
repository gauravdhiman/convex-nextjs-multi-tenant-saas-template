import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Function to link OAuth account to existing email/password account
export const linkOAuthToExistingAccount = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Find existing user with same email but different ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .filter((q) => q.neq(q.field("_id"), currentUserId))
      .first();

    if (!existingUser) {
      return { linked: false, message: "No existing account found with this email" };
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // Update existing user with OAuth profile data
    await ctx.db.patch(existingUser._id, {
      name: currentUser.name || existingUser.name,
      image: currentUser.image || existingUser.image,
      updatedAt: Date.now(),
    });

    // Move auth accounts from current user to existing user
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.patch(account._id, {
        userId: existingUser._id,
      });
    }

    // Delete the duplicate user
    await ctx.db.delete(currentUserId);

    return { linked: true, message: "Accounts successfully linked" };
  },
});

// Check if there are duplicate accounts for the same email
export const checkForDuplicateAccounts = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser?.email) {
      return null;
    }

    // Find other users with same email
    const duplicateUsers = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", currentUser.email))
      .filter((q) => q.neq(q.field("_id"), currentUserId))
      .collect();

    return {
      hasDuplicates: duplicateUsers.length > 0,
      duplicateCount: duplicateUsers.length,
      currentUser: currentUser,
      duplicateUsers: duplicateUsers,
    };
  },
});