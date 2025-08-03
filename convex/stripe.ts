import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";

// Initialize Stripe
const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });
};

// Internal query to get organization
export const getOrganization = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

// Internal mutation to update organization Stripe customer ID
export const updateOrganizationStripeCustomer = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organizationId, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });
  },
});

// Internal action to create checkout session for subscription
export const createCheckoutSession = internalAction({
  args: {
    organizationId: v.id("organizations"),
    plan: v.object({
      planId: v.string(),
      name: v.string(),
      stripePriceIdMonthly: v.string(),
      stripePriceIdYearly: v.string(),
      monthlyPrice: v.number(),
      yearlyPrice: v.number(),
      creditsIncluded: v.number(),
    }),
    interval: v.union(v.literal("month"), v.literal("year")),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const stripe = getStripe();
    
    const priceId = args.interval === "month" 
      ? args.plan.stripePriceIdMonthly 
      : args.plan.stripePriceIdYearly;

    // Get organization details via internal query
    const organization = await ctx.runQuery(internal.stripe.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    let customerId = args.customerId;

    // Create or get Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.contactEmail,
        name: organization.name,
        metadata: {
          organizationId: args.organizationId,
        },
      });
      customerId = customer.id;

      // Update organization with Stripe customer ID via internal mutation
      await ctx.runMutation(internal.stripe.updateOrganizationStripeCustomer, {
        organizationId: args.organizationId,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.SITE_URL}/dashboard/billing?subscription=success`,
      cancel_url: `${process.env.SITE_URL}/dashboard/billing?subscription=cancelled`,
      metadata: {
        organizationId: args.organizationId,
        planId: args.plan.planId,
      },
      subscription_data: {
        metadata: {
          organizationId: args.organizationId,
          planId: args.plan.planId,
        },
      },
    });

    return { url: session.url };
  },
});

// Internal action to create checkout session for credit purchase
export const createCreditCheckoutSession = internalAction({
  args: {
    organizationId: v.id("organizations"),
    creditPackage: v.object({
      packageId: v.string(),
      name: v.string(),
      stripePriceId: v.string(),
      credits: v.number(),
      price: v.number(),
    }),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const stripe = getStripe();

    // Get organization details
    const organization = await ctx.runQuery(internal.stripe.getOrganization, {
      organizationId: args.organizationId,
    });
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    let customerId = args.customerId;

    // Create or get Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.contactEmail,
        name: organization.name,
        metadata: {
          organizationId: args.organizationId,
        },
      });
      customerId = customer.id;

      // Update organization with Stripe customer ID
      await ctx.runMutation(internal.stripe.updateOrganizationStripeCustomer, {
        organizationId: args.organizationId,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: args.creditPackage.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.SITE_URL}/dashboard/billing?credits=success`,
      cancel_url: `${process.env.SITE_URL}/dashboard/billing?credits=cancelled`,
      metadata: {
        organizationId: args.organizationId,
        packageId: args.creditPackage.packageId,
        credits: args.creditPackage.credits.toString(),
      },
    });

    return { url: session.url };
  },
});

// Internal action to cancel subscription
export const cancelSubscription = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const stripe = getStripe();

    if (args.cancelAtPeriodEnd) {
      // Cancel at period end
      await stripe.subscriptions.update(args.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      await stripe.subscriptions.cancel(args.stripeSubscriptionId);
    }

    return { success: true };
  },
});

// Internal query to get Stripe event
export const getStripeEvent = internalQuery({
  args: {
    stripeEventId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stripeEvents")
      .withIndex("by_stripe_event_id", (q) => q.eq("stripeEventId", args.stripeEventId))
      .first();
  },
});

// Internal mutation to store Stripe event
export const storeStripeEvent = internalMutation({
  args: {
    stripeEventId: v.string(),
    eventType: v.string(),
    data: v.any(), // Stripe event data structure is complex, keeping as any for now
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stripeEvents", {
      stripeEventId: args.stripeEventId,
      eventType: args.eventType,
      processed: false,
      data: args.data,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation to mark event as processed
export const markEventProcessed = internalMutation({
  args: {
    stripeEventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("stripeEvents")
      .withIndex("by_stripe_event_id", (q) => q.eq("stripeEventId", args.stripeEventId))
      .first();

    if (event) {
      await ctx.db.patch(event._id, {
        processed: true,
        processedAt: Date.now(),
      });
    }
  },
});

// Internal mutation to handle subscription created/updated
export const handleSubscriptionChange = internalMutation({
  args: {
    stripeSubscription: v.any(), // Accept the full Stripe subscription object
  },
  handler: async (ctx, args) => {
    const subscription = args.stripeSubscription;
    
    // Safely extract required fields with proper validation
    const organizationId = subscription?.metadata?.organizationId;
    const planId = subscription?.metadata?.planId;
    const subscriptionId = subscription?.id;
    const customerId = subscription?.customer;
    const status = subscription?.status;
    const cancelAtPeriodEnd = subscription?.cancel_at_period_end;
    const trialEnd = subscription?.trial_end;

    // Validate required fields
    if (!organizationId || !subscriptionId || !customerId || !status) {
      console.error("Missing required fields in subscription webhook:", {
        organizationId: !!organizationId,
        subscriptionId: !!subscriptionId,
        customerId: !!customerId,
        status: !!status,
      });
      return;
    }

    // Safely extract price and period information
    const firstItem = subscription?.items?.data?.[0];
    if (!firstItem) {
      console.error("No subscription items found in webhook");
      return;
    }

    const priceId = firstItem.price?.id || firstItem.plan?.id;
    const currentPeriodStart = firstItem.current_period_start;
    const currentPeriodEnd = firstItem.current_period_end;

    if (!priceId || !currentPeriodStart || !currentPeriodEnd) {
      console.error("Missing price or period information:", {
        priceId: !!priceId,
        currentPeriodStart: !!currentPeriodStart,
        currentPeriodEnd: !!currentPeriodEnd,
      });
      return;
    }

    // Check if subscription already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", subscriptionId))
      .first();

    const subscriptionData = {
      organizationId: organizationId as any,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      planId: planId || "",
      status: status as "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid",
      currentPeriodStart: currentPeriodStart * 1000,
      currentPeriodEnd: currentPeriodEnd * 1000,
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      trialEnd: trialEnd ? trialEnd * 1000 : undefined,
      updatedAt: Date.now(),
    };

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, subscriptionData);
      console.log(`Updated subscription: ${subscriptionId}`);
    } else {
      // Create new subscription
      await ctx.db.insert("subscriptions", {
        ...subscriptionData,
        createdAt: Date.now(),
      });
      console.log(`Created new subscription: ${subscriptionId}`);

      // Add initial credits if this is a new active subscription
      if (status === "active" && planId) {
        const plan = await ctx.db
          .query("subscriptionPlans")
          .withIndex("by_plan_id", (q) => q.eq("planId", planId))
          .first();

        if (plan) {
          await ctx.runMutation(internal.subscriptions.addCredits, {
            organizationId: organizationId as any,
            amount: plan.creditsIncluded,
            type: "earned" as const,
            description: `Credits from ${plan.name} subscription`,
            metadata: {
              subscriptionId: subscriptionId,
            },
          });
          console.log(`Added ${plan.creditsIncluded} credits for subscription: ${subscriptionId}`);
        } else {
          console.warn(`Plan not found for planId: ${planId}`);
        }
      }
    }
  },
});

// Internal mutation to handle successful payment for credits
export const handleCreditPurchase = internalMutation({
  args: {
    checkoutSession: v.any(), // Accept full Stripe checkout session object
  },
  handler: async (ctx, args) => {
    const session = args.checkoutSession;
    const organizationId = session.metadata.organizationId;
    const creditsStr = session.metadata.credits;

    if (!organizationId || !creditsStr) {
      console.error("Missing organizationId or credits in session metadata");
      return;
    }

    const credits = parseInt(creditsStr);
    if (isNaN(credits)) {
      console.error("Invalid credits value in session metadata");
      return;
    }

    // Add purchased credits
    await ctx.runMutation(internal.subscriptions.addCredits, {
      organizationId: organizationId as any,
      amount: credits,
      type: "purchased" as const,
      description: `Purchased ${credits} credits`,
      metadata: {
        stripePaymentIntentId: session.payment_intent,
      },
    });
  },
});

// Internal mutation to handle subscription renewal (add credits)
export const handleSubscriptionRenewal = internalMutation({
  args: {
    stripeSubscription: v.any(), // Accept full Stripe subscription object
  },
  handler: async (ctx, args) => {
    const subscription = args.stripeSubscription;
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      console.error("No organizationId in subscription metadata");
      return;
    }

    // Get plan details
    const plan = await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_plan_id", (q) => q.eq("planId", subscription.metadata.planId || ""))
      .first();

    if (plan && subscription.status === "active") {
      // Add credits for the new billing period
      await ctx.runMutation(internal.subscriptions.addCredits, {
        organizationId: organizationId as any,
        amount: plan.creditsIncluded,
        type: "earned" as const,
        description: `Credits from ${plan.name} subscription renewal`,
        metadata: {
          subscriptionId: subscription.id,
        },
      });
    }
  },
});