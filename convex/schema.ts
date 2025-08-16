import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    // Override the default users table to add custom fields for our SaaS template
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerified: v.optional(v.number()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        lastLoginAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
        // Custom fields for our SaaS template
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        profilePicture: v.optional(v.string()),
        timezone: v.optional(v.string()),
        locale: v.optional(v.string()),
        // Security settings
        twoFactorEnabled: v.optional(v.boolean()),
        twoFactorSecret: v.optional(v.string()),
        backupCodes: v.optional(v.array(v.string())),
    }).index("email", ["email"]),

    // Organizations table - multi-tenant isolation
    organizations: defineTable({
        name: v.string(),
        slug: v.string(), // URL-friendly identifier
        description: v.optional(v.string()),
        website: v.optional(v.string()),
        logo: v.optional(v.string()),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
        // Billing information
        stripeCustomerId: v.optional(v.string()),
        // Settings
        settings: v.optional(v.object({
        allowUserInvites: v.boolean(),
        requireEmailVerification: v.boolean(),
        sessionTimeout: v.number(), // in minutes
        maxUsers: v.optional(v.number()),
        })),
        // Contact information
        contactEmail: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        address: v.optional(v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
        country: v.string(),
        })),
    })
        .index("by_slug", ["slug"])
        .index("by_active", ["isActive"])
        .index("by_created", ["createdAt"])
        .index("by_stripe_customer", ["stripeCustomerId"]),

    // Organization members - links users to organizations with roles
    organizationMembers: defineTable({
        userId: v.id("users"),
        organizationId: v.id("organizations"),
        role: v.union(
        v.literal("owner"),
        v.literal("admin"),
        v.literal("member"),
        v.literal("viewer")
        ),
        isActive: v.boolean(),
        invitedAt: v.optional(v.number()),
        joinedAt: v.optional(v.number()),
        invitedBy: v.optional(v.id("users")),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_organization", ["organizationId"])
        .index("by_user_organization", ["userId", "organizationId"])
        .index("by_role", ["role"])
        .index("by_active", ["isActive"]),

    // Invitations table - for user invitations to organizations
    invitations: defineTable({
        email: v.string(),
        organizationId: v.id("organizations"),
        role: v.union(
        v.literal("admin"),
        v.literal("member"),
        v.literal("viewer")
        ),
        invitedBy: v.id("users"),
        token: v.string(), // unique invitation token
        status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("expired"),
        v.literal("cancelled")
        ),
        expiresAt: v.number(),
        acceptedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_organization", ["organizationId"])
        .index("by_token", ["token"])
        .index("by_status", ["status"])
        .index("by_expires", ["expiresAt"]),
    
    // Subscriptions table - billing and subscription management
    subscriptions: defineTable({
        organizationId: v.id("organizations"),
        stripeSubscriptionId: v.string(),
        stripeCustomerId: v.string(),
        stripePriceId: v.string(),
        planId: v.string(),
        status: v.union(
            v.literal("active"),
            v.literal("canceled"),
            v.literal("incomplete"),
            v.literal("incomplete_expired"),
            v.literal("past_due"),
            v.literal("trialing"),
            v.literal("unpaid")
        ),
        currentPeriodStart: v.number(),
        currentPeriodEnd: v.number(),
        cancelAtPeriodEnd: v.boolean(),
        trialEnd: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_stripe_subscription", ["stripeSubscriptionId"])
        .index("by_stripe_customer", ["stripeCustomerId"])
        .index("by_status", ["status"]),

    // Subscription plans - defines available plans with features and credits
    subscriptionPlans: defineTable({
        planId: v.string(), // e.g., "starter", "pro", "enterprise"
        name: v.string(),
        description: v.string(),
        stripePriceIdMonthly: v.string(),
        stripePriceIdYearly: v.string(),
        monthlyPrice: v.number(), // in cents
        yearlyPrice: v.number(), // in cents
        currency: v.string(),
        creditsIncluded: v.number(), // credits included per billing period
        features: v.array(v.string()),
        maxUsers: v.optional(v.number()),
        maxProjects: v.optional(v.number()),
        isActive: v.boolean(),
        sortOrder: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_plan_id", ["planId"])
        .index("by_active", ["isActive"])
        .index("by_sort_order", ["sortOrder"]),

    // Credits tracking - tracks credit usage and purchases
    credits: defineTable({
        organizationId: v.id("organizations"),
        balance: v.number(), // current total credit balance
        totalEarned: v.number(), // total credits earned (from subscriptions)
        totalPurchased: v.number(), // total credits purchased separately
        totalBonus: v.optional(v.number()), // total bonus credits received
        totalRefunded: v.optional(v.number()), // total refunded credits received
        totalUsed: v.number(), // total credits consumed
        lastUpdated: v.number(),
    })
        .index("by_organization", ["organizationId"]),

    // Individual credit entries - for tracking expiration and priority consumption
    creditEntries: defineTable({
        organizationId: v.id("organizations"),
        type: v.union(
            v.literal("earned"), // from subscription renewal
            v.literal("purchased"), // one-time credit purchase
            v.literal("bonus"), // promotional/incentive credits
            v.literal("refunded") // refunded credits
        ),
        amount: v.number(), // original amount
        remaining: v.number(), // remaining amount (after partial consumption)
        description: v.string(),
        expiresAt: v.optional(v.number()), // expiration timestamp (null = never expires)
        metadata: v.optional(v.object({
            subscriptionId: v.optional(v.string()),
            stripePaymentIntentId: v.optional(v.string()),
            promotionCode: v.optional(v.string()),
            referralId: v.optional(v.string()),
        })),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_type", ["type"])
        .index("by_expires", ["expiresAt"])
        .index("by_organization_expires", ["organizationId", "expiresAt"])
        .index("by_organization_type", ["organizationId", "type"]),

    // Credit transactions - audit trail for all credit changes
    creditTransactions: defineTable({
        organizationId: v.id("organizations"),
        type: v.union(
            v.literal("earned"), // from subscription renewal
            v.literal("purchased"), // one-time credit purchase
            v.literal("bonus"), // promotional/incentive credits
            v.literal("used"), // consumed by usage
            v.literal("refunded"), // refunded credits
            v.literal("expired"), // expired credits
            v.literal("adjustment") // manual adjustment
        ),
        amount: v.number(), // positive for additions, negative for deductions
        description: v.string(),
        metadata: v.optional(v.object({
            subscriptionId: v.optional(v.string()),
            stripePaymentIntentId: v.optional(v.string()),
            serviceUsed: v.optional(v.string()),
            userId: v.optional(v.id("users")),
        })),
        createdAt: v.number(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_type", ["type"])
        .index("by_created_at", ["createdAt"]),

    // Credit packages - one-time credit purchases
    creditPackages: defineTable({
        packageId: v.string(), // e.g., "credits_100", "credits_500"
        name: v.string(),
        description: v.string(),
        stripePriceId: v.string(),
        credits: v.number(),
        price: v.number(), // in cents
        currency: v.string(),
        isActive: v.boolean(),
        sortOrder: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_package_id", ["packageId"])
        .index("by_active", ["isActive"])
        .index("by_sort_order", ["sortOrder"]),

    // Stripe events - webhook event tracking for idempotency
    stripeEvents: defineTable({
        stripeEventId: v.string(),
        eventType: v.string(),
        processed: v.boolean(),
        processedAt: v.optional(v.number()),
        data: v.any(), // store the full event data
        createdAt: v.number(),
    })
        .index("by_stripe_event_id", ["stripeEventId"])
        .index("by_processed", ["processed"]),
});
