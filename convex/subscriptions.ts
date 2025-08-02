import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

// Query to get subscription plans
export const getSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

// Query to get organization's current subscription
export const getOrganizationSubscription = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!membership) {
      throw new ConvexError("Not authorized to view this organization");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!subscription) {
      return null;
    }

    // Get the plan details
    const plan = await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_plan_id", (q) => q.eq("planId", subscription.planId))
      .first();

    return {
      ...subscription,
      plan,
    };
  },
});

// Query to get organization's credit balance
export const getOrganizationCredits = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!membership) {
      throw new ConvexError("Not authorized to view this organization");
    }

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    return credits || {
      balance: 0,
      totalEarned: 0,
      totalPurchased: 0,
      totalUsed: 0,
    };
  },
});

// Query to get credit transaction history
export const getCreditTransactions = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!membership) {
      throw new ConvexError("Not authorized to view this organization");
    }

    const limit = args.limit || 50;
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);
  },
});

// Query to get available credit packages
export const getCreditPackages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("creditPackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

// Mutation to consume credits
export const consumeCredits = mutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    description: v.string(),
    serviceUsed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!membership) {
      throw new ConvexError("Not authorized to use credits for this organization");
    }

    // Get current credit balance
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!credits || credits.balance < args.amount) {
      throw new ConvexError("Insufficient credits");
    }

    // Update credit balance
    await ctx.db.patch(credits._id, {
      balance: credits.balance - args.amount,
      totalUsed: credits.totalUsed + args.amount,
      lastUpdated: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: "used",
      amount: -args.amount,
      description: args.description,
      metadata: {
        serviceUsed: args.serviceUsed,
        userId,
      },
      createdAt: Date.now(),
    });

    return { success: true, newBalance: credits.balance - args.amount };
  },
});

// Internal query to get user organization membership
export const getUserOrganizationMembership = internalQuery({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Internal query to get subscription plan by ID
export const getSubscriptionPlanById = internalQuery({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_plan_id", (q) => q.eq("planId", args.planId))
      .first();
  },
});

// Internal query to get credit package by ID
export const getCreditPackageById = internalQuery({
  args: {
    packageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creditPackages")
      .withIndex("by_package_id", (q) => q.eq("packageId", args.packageId))
      .first();
  },
});

// Internal query to get organization subscription (for internal use)
export const getOrganizationSubscriptionInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

// Internal mutation to add credits (used by webhooks and internal processes)
export const addCredits = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    type: v.union(v.literal("earned"), v.literal("purchased"), v.literal("refunded"), v.literal("adjustment")),
    description: v.string(),
    metadata: v.optional(v.object({
      subscriptionId: v.optional(v.string()),
      stripePaymentIntentId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get or create credit record
    let credits = await ctx.db
      .query("credits")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!credits) {
      const creditId = await ctx.db.insert("credits", {
        organizationId: args.organizationId,
        balance: 0,
        totalEarned: 0,
        totalPurchased: 0,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });
      credits = await ctx.db.get(creditId);
      if (!credits) {
        throw new ConvexError("Failed to create credits record");
      }
    }

    // Update credit balance based on type
    const updates = {
      balance: credits.balance + args.amount,
      lastUpdated: Date.now(),
      ...(args.type === "earned" && { totalEarned: credits.totalEarned + args.amount }),
      ...(args.type === "purchased" && { totalPurchased: credits.totalPurchased + args.amount }),
    };

    await ctx.db.patch(credits._id, updates);

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: args.type,
      amount: args.amount,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { success: true, newBalance: credits.balance + args.amount };
  },
});

// Action to create Stripe checkout session for subscription
export const createSubscriptionCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    planId: v.string(),
    interval: v.union(v.literal("month"), v.literal("year")),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has admin access to this organization via internal query
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new ConvexError("Not authorized to manage subscriptions for this organization");
    }

    // Get organization and plan details via internal queries
    const organization = await ctx.runQuery(internal.stripe.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    const plan = await ctx.runQuery(internal.subscriptions.getSubscriptionPlanById, {
      planId: args.planId,
    });

    if (!plan || !plan.isActive) {
      throw new ConvexError("Plan not found or inactive");
    }

    // Call internal action to create Stripe checkout
    return await ctx.runAction(internal.stripe.createCheckoutSession, {
      organizationId: args.organizationId,
      plan,
      interval: args.interval,
      customerId: organization.stripeCustomerId,
    });
  },
});

// Action to create Stripe checkout session for credit purchase
export const createCreditCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    packageId: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has admin access to this organization via internal query
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new ConvexError("Not authorized to purchase credits for this organization");
    }

    // Get organization and package details via internal queries
    const organization = await ctx.runQuery(internal.stripe.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    const creditPackage = await ctx.runQuery(internal.subscriptions.getCreditPackageById, {
      packageId: args.packageId,
    });

    if (!creditPackage || !creditPackage.isActive) {
      throw new ConvexError("Credit package not found or inactive");
    }

    // Call internal action to create Stripe checkout
    return await ctx.runAction(internal.stripe.createCreditCheckoutSession, {
      organizationId: args.organizationId,
      creditPackage,
      customerId: organization.stripeCustomerId,
    });
  },
});

// Action to cancel subscription
export const cancelSubscription = action({
  args: {
    organizationId: v.id("organizations"),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has admin access to this organization via internal query
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new ConvexError("Not authorized to manage subscriptions for this organization");
    }

    // Get current subscription via internal query
    const subscription = await ctx.runQuery(internal.subscriptions.getOrganizationSubscriptionInternal, {
      organizationId: args.organizationId,
    });

    if (!subscription) {
      throw new ConvexError("No active subscription found");
    }

    // Call internal action to cancel Stripe subscription
    return await ctx.runAction(internal.stripe.cancelSubscription, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
    });
  },
});