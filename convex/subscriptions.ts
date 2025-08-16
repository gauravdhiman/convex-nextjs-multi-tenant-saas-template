
import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

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

// Query to get credit packages
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

// Query to get organization subscription
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

    // Get subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!subscription) {
      return null;
    }

    // Get plan details
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

// Internal query to get organization subscription (for internal use)
export const getOrganizationSubscriptionInternal = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

// Query to get organization credits
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
      totalBonus: 0,
      totalRefunded: 0,
      totalUsed: 0,
    };
  },
});

// Query to get credit transactions
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

// Action to create subscription checkout
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

    // Verify user has admin access to this organization
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new ConvexError("Not authorized to manage subscriptions for this organization");
    }

    // Get plan details via internal query
    const plan = await ctx.runQuery(internal.subscriptions.getSubscriptionPlan, {
      planId: args.planId,
    });

    if (!plan) {
      throw new ConvexError("Plan not found");
    }

    // Get organization details via internal query
    const organization = await ctx.runQuery(internal.subscriptions.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    // Create checkout session via internal action
    return await ctx.runAction(internal.stripe.createCheckoutSession, {
      organizationId: args.organizationId,
      plan: {
        planId: plan.planId,
        name: plan.name,
        stripePriceIdMonthly: plan.stripePriceIdMonthly,
        stripePriceIdYearly: plan.stripePriceIdYearly,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        creditsIncluded: plan.creditsIncluded,
      },
      interval: args.interval,
      customerId: organization.stripeCustomerId,
    });
  },
});

// Action to create credit checkout
export const createCreditCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    packageId: v.string(),
    creditPackage: v.object({
      packageId: v.string(),
      name: v.string(),
      stripePriceId: v.string(),
      credits: v.number(),
      price: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has access to this organization
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership) {
      throw new ConvexError("Not authorized to purchase credits for this organization");
    }

    // Get organization details via internal query
    const organization = await ctx.runQuery(internal.subscriptions.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    // Create checkout session via internal action
    return await ctx.runAction(internal.stripe.createCreditCheckoutSession, {
      organizationId: args.organizationId,
      creditPackage: args.creditPackage,
      customerId: organization.stripeCustomerId,
    });
  },
});

// Internal mutation to add credits (used by webhooks and internal processes)
export const addCredits = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    type: v.union(v.literal("earned"), v.literal("purchased"), v.literal("bonus"), v.literal("refunded"), v.literal("adjustment")),
    description: v.string(),
    expiresAt: v.optional(v.number()), // expiration timestamp
    metadata: v.optional(v.object({
      subscriptionId: v.optional(v.string()),
      stripePaymentIntentId: v.optional(v.string()),
      promotionCode: v.optional(v.string()),
      referralId: v.optional(v.string()),
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
        totalBonus: 0,
        totalRefunded: 0,
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
      ...(args.type === "bonus" && { totalBonus: (credits.totalBonus || 0) + args.amount }),
      ...(args.type === "refunded" && { totalRefunded: (credits.totalRefunded || 0) + args.amount }),
    };

    await ctx.db.patch(credits._id, updates);

    // Create credit entry for tracking expiration and consumption priority
    if (args.type !== "adjustment") {
      await ctx.db.insert("creditEntries", {
        organizationId: args.organizationId,
        type: args.type as "earned" | "purchased" | "bonus" | "refunded",
        amount: args.amount,
        remaining: args.amount,
        description: args.description,
        expiresAt: args.expiresAt,
        metadata: args.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

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

// Internal mutation to log subscription events for audit trail
export const logSubscriptionEvent = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    subscriptionId: v.string(),
    eventType: v.string(),
    userId: v.id("users"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Log as a credit transaction with 0 amount for audit purposes
    await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: "adjustment",
      amount: 0,
      description: args.description,
      metadata: {
        subscriptionId: args.subscriptionId,
        userId: args.userId,
      },
      createdAt: Date.now(),
    });
  },
});

// Mutation to consume credits with priority-based consumption
export const consumeCredits = mutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    description: v.string(),
    serviceUsed: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; newBalance: number; consumedBreakdown: Array<{ entryId: any; consumed: number; type: string }> }> => {
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

    // Consume credits using priority-based consumption
    const consumptionResult: { success: boolean; newBalance: number; consumedBreakdown: Array<{ entryId: any; consumed: number; type: string }> } = await ctx.runMutation(internal.subscriptions.consumeCreditsWithPriority, {
      organizationId: args.organizationId,
      amount: args.amount,
      description: args.description,
      serviceUsed: args.serviceUsed,
      userId,
    });

    return consumptionResult;
  },
});

// Action to cancel subscription (always at period end)
export const cancelSubscription = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; subscription: any }> => {
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

    // Call internal action to cancel Stripe subscription (always at period end)
    return await ctx.runAction(internal.stripe.cancelSubscription, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      cancelAtPeriodEnd: true,
    });
  },
});

// Action to reactivate subscription
export const reactivateSubscription = action({
  args: {
    organizationId: v.id("organizations"),
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
      throw new ConvexError("No subscription found");
    }

    if (subscription.status === "canceled") {
      throw new ConvexError("Cannot reactivate - subscription has ended. Please create a new subscription.");
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new ConvexError("Subscription is not scheduled for cancellation");
    }

    // Call internal action to reactivate Stripe subscription
    const result = await ctx.runAction(internal.stripe.reactivateSubscription, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    });

    // Add audit log for reactivation
    if (result.success) {
      await ctx.runMutation(internal.subscriptions.logSubscriptionEvent, {
        organizationId: args.organizationId,
        subscriptionId: subscription.stripeSubscriptionId,
        eventType: "reactivation",
        userId,
        description: "Subscription reactivated by user",
      });
    }

    return { success: result.success };
  },
});


// Internal mutation for priority-based credit consumption
export const consumeCreditsWithPriority = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    description: v.string(),
    serviceUsed: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let remainingToConsume = args.amount;
    const consumedEntries: Array<{ entryId: any; consumed: number; type: string }> = [];

    // Priority order: bonus (expire soonest) -> earned (by expiration) -> refunded (oldest) -> purchased (oldest)

    // 1. Consume bonus credits first (expire soonest)
    const bonusCredits = await ctx.db
      .query("creditEntries")
      .withIndex("by_organization_type", (q) =>
        q.eq("organizationId", args.organizationId).eq("type", "bonus")
      )
      .filter((q) => q.gt(q.field("remaining"), 0))
      .collect();

    // Sort bonus credits by expiration (soonest first)
    bonusCredits.sort((a, b) => (a.expiresAt || Infinity) - (b.expiresAt || Infinity));

    for (const entry of bonusCredits) {
      if (remainingToConsume <= 0) break;

      const toConsume = Math.min(remainingToConsume, entry.remaining);
      await ctx.db.patch(entry._id, {
        remaining: entry.remaining - toConsume,
        updatedAt: Date.now(),
      });

      consumedEntries.push({ entryId: entry._id, consumed: toConsume, type: "bonus" });
      remainingToConsume -= toConsume;
    }

    // 2. Consume earned credits (by expiration date, oldest first)
    if (remainingToConsume > 0) {
      const earnedCredits = await ctx.db
        .query("creditEntries")
        .withIndex("by_organization_type", (q) =>
          q.eq("organizationId", args.organizationId).eq("type", "earned")
        )
        .filter((q) => q.gt(q.field("remaining"), 0))
        .collect();

      // Sort earned credits by expiration (soonest first)
      earnedCredits.sort((a, b) => (a.expiresAt || Infinity) - (b.expiresAt || Infinity));

      for (const entry of earnedCredits) {
        if (remainingToConsume <= 0) break;

        const toConsume = Math.min(remainingToConsume, entry.remaining);
        await ctx.db.patch(entry._id, {
          remaining: entry.remaining - toConsume,
          updatedAt: Date.now(),
        });

        consumedEntries.push({ entryId: entry._id, consumed: toConsume, type: "earned" });
        remainingToConsume -= toConsume;
      }
    }

    // 3. Consume refunded credits (oldest first)
    if (remainingToConsume > 0) {
      const refundedCredits = await ctx.db
        .query("creditEntries")
        .withIndex("by_organization_type", (q) =>
          q.eq("organizationId", args.organizationId).eq("type", "refunded")
        )
        .filter((q) => q.gt(q.field("remaining"), 0))
        .order("asc")
        .collect();

      for (const entry of refundedCredits) {
        if (remainingToConsume <= 0) break;

        const toConsume = Math.min(remainingToConsume, entry.remaining);
        await ctx.db.patch(entry._id, {
          remaining: entry.remaining - toConsume,
          updatedAt: Date.now(),
        });

        consumedEntries.push({ entryId: entry._id, consumed: toConsume, type: "refunded" });
        remainingToConsume -= toConsume;
      }
    }

    // 4. Consume purchased credits (oldest first)
    if (remainingToConsume > 0) {
      const purchasedCredits = await ctx.db
        .query("creditEntries")
        .withIndex("by_organization_type", (q) =>
          q.eq("organizationId", args.organizationId).eq("type", "purchased")
        )
        .filter((q) => q.gt(q.field("remaining"), 0))
        .order("asc")
        .collect();

      for (const entry of purchasedCredits) {
        if (remainingToConsume <= 0) break;

        const toConsume = Math.min(remainingToConsume, entry.remaining);
        await ctx.db.patch(entry._id, {
          remaining: entry.remaining - toConsume,
          updatedAt: Date.now(),
        });

        consumedEntries.push({ entryId: entry._id, consumed: toConsume, type: "purchased" });
        remainingToConsume -= toConsume;
      }
    }

    if (remainingToConsume > 0) {
      throw new ConvexError("Insufficient credits available for consumption");
    }

    // Update main credits record
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (credits) {
      await ctx.db.patch(credits._id, {
        balance: credits.balance - args.amount,
        totalUsed: credits.totalUsed + args.amount,
        lastUpdated: Date.now(),
      });
    }

    // Record transaction with consumption details
    await ctx.db.insert("creditTransactions", {
      organizationId: args.organizationId,
      type: "used",
      amount: -args.amount,
      description: args.description,
      metadata: {
        serviceUsed: args.serviceUsed,
        userId: args.userId,
      },
      createdAt: Date.now(),
    });

    return {
      success: true,
      newBalance: credits ? credits.balance - args.amount : 0,
      consumedBreakdown: consumedEntries
    };
  },
});

// Action to add bonus credits (for promotions, referrals, etc.)
export const addBonusCredits = action({
  args: {
    organizationId: v.id("organizations"),
    amount: v.number(),
    description: v.string(),
    expiresInDays: v.optional(v.number()), // defaults to 90 days
    metadata: v.optional(v.object({
      promotionCode: v.optional(v.string()),
      referralId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<{ success: boolean; newBalance: number }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Verify user has admin access to this organization
    const membership = await ctx.runQuery(internal.subscriptions.getUserOrganizationMembership, {
      userId,
      organizationId: args.organizationId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new ConvexError("Not authorized to add bonus credits for this organization");
    }

    // Calculate expiration date (default 90 days)
    const expiresInDays = args.expiresInDays || 90;
    const expiresAt = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);

    // Add bonus credits
    return await ctx.runMutation(internal.subscriptions.addCredits, {
      organizationId: args.organizationId,
      amount: args.amount,
      type: "bonus",
      description: args.description,
      expiresAt,
      metadata: args.metadata,
    });
  },
});

// Query to get detailed credit breakdown by type
export const getCreditBreakdown = query({
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

    // Get all active credit entries
    const creditEntries = await ctx.db
      .query("creditEntries")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.gt(q.field("remaining"), 0))
      .collect();

    // Group by type and calculate totals
    const breakdown = {
      bonus: { total: 0, expiringSoon: 0, entries: [] as any[] },
      earned: { total: 0, expiringSoon: 0, entries: [] as any[] },
      refunded: { total: 0, expiringSoon: 0, entries: [] as any[] },
      purchased: { total: 0, expiringSoon: 0, entries: [] as any[] },
    };

    const now = Date.now();
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);

    for (const entry of creditEntries) {
      const type = entry.type as keyof typeof breakdown;
      breakdown[type].total += entry.remaining;
      breakdown[type].entries.push(entry);

      // Check if expiring soon (within 30 days)
      if (entry.expiresAt && entry.expiresAt <= thirtyDaysFromNow) {
        breakdown[type].expiringSoon += entry.remaining;
      }
    }

    return breakdown;
  },
});

// Internal query to get subscription plan
export const getSubscriptionPlan = internalQuery({
  args: { planId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_plan_id", (q) => q.eq("planId", args.planId))
      .first();
  },
});

// Internal query to get organization
export const getOrganization = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

// Internal mutation to expire credits
export const expireCredits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all expired credit entries
    const expiredEntries = await ctx.db
      .query("creditEntries")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .filter((q) => q.gt(q.field("remaining"), 0))
      .collect();

    let totalExpired = 0;

    for (const entry of expiredEntries) {
      const expiredAmount = entry.remaining;
      totalExpired += expiredAmount;

      // Mark entry as fully consumed
      await ctx.db.patch(entry._id, {
        remaining: 0,
        updatedAt: now,
      });

      // Update main credits record
      const credits = await ctx.db
        .query("credits")
        .withIndex("by_organization", (q) => q.eq("organizationId", entry.organizationId))
        .first();

      if (credits) {
        await ctx.db.patch(credits._id, {
          balance: credits.balance - expiredAmount,
          lastUpdated: now,
        });
      }

      // Record expiration transaction
      await ctx.db.insert("creditTransactions", {
        organizationId: entry.organizationId,
        type: "expired",
        amount: -expiredAmount,
        description: `Expired ${entry.type} credits: ${entry.description}`,
        createdAt: now,
      });
    }

    return { expiredEntries: expiredEntries.length, totalExpired };
  },
});
