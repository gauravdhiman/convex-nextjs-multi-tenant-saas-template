import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireAuth } from "./lib/auth";

export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    await ctx.db.patch(user._id, {
      name: args.name,
      profilePicture: args.profilePicture,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Check if email is already taken
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (existingUser && existingUser._id !== user._id) {
      throw new Error("Email already in use");
    }
    
    await ctx.db.patch(user._id, {
      email: args.email,
      emailVerified: false, // Require re-verification
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const enableTwoFactor = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    await ctx.db.patch(user._id, {
      twoFactorEnabled: true,
      twoFactorSecret: args.secret,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const disableTwoFactor = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    
    await ctx.db.patch(user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});