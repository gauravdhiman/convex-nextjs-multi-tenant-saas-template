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
    
});
