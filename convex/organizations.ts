import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Query to get organization by ID
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new ConvexError("Organization not found");
    }
    return organization;
  },
});

// Query to get organization by slug
export const getOrganizationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    return organization;
  },
});

// Mutation to create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if slug is already taken
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existingOrg) {
      throw new ConvexError("Organization slug already exists, please choose a different one.");
    }
    
    const now = Date.now();
    
    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      website: args.website,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      settings: {
        allowUserInvites: true,
        requireEmailVerification: true,
        sessionTimeout: 1440, // 24 hours
      },
    });
    
    // Add owner as organization member
    await ctx.db.insert("organizationMembers", {
      userId: args.ownerId,
      organizationId,
      role: "owner",
      isActive: true,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    
    return organizationId;
  },
});

// Query to get organization members
export const getOrganizationMembers = query({
  args: { 
    organizationId: v.id("organizations"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let membersQuery = ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));
    
    if (!args.includeInactive) {
      membersQuery = membersQuery.filter((q) => q.eq(q.field("isActive"), true));
    }
    
    const members = await membersQuery.collect();
    
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;
        
        // Remove sensitive user data
        const { twoFactorSecret, backupCodes, ...sanitizedUser } = user;
        
        return {
          ...member,
          user: sanitizedUser,
        };
      })
    );
    
    return membersWithUsers.filter(Boolean);
  },
});

// Mutation to update organization
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    settings: v.optional(v.object({
      allowUserInvites: v.optional(v.boolean()),
      requireEmailVerification: v.optional(v.boolean()),
      sessionTimeout: v.optional(v.number()),
      maxUsers: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;
    
    const organization = await ctx.db.get(organizationId);
    if (!organization) {
      throw new ConvexError("Organization not found");
    }
    
    // Merge settings if provided
    let updatedSettings = organization.settings;
    if (updates.settings) {
      updatedSettings = {
        allowUserInvites: updates.settings.allowUserInvites ?? organization.settings?.allowUserInvites ?? true,
        requireEmailVerification: updates.settings.requireEmailVerification ?? organization.settings?.requireEmailVerification ?? true,
        sessionTimeout: updates.settings.sessionTimeout ?? organization.settings?.sessionTimeout ?? 1440,
        maxUsers: updates.settings.maxUsers ?? organization.settings?.maxUsers,
      };
    }
    
    await ctx.db.patch(organizationId, {
      ...updates,
      settings: updatedSettings,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Mutation to add member to organization
export const addOrganizationMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    invitedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if user is already a member
    const existingMember = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();
    
    if (existingMember) {
      throw new ConvexError("User is already a member of this organization");
    }
    
    const now = Date.now();
    
    const memberId = await ctx.db.insert("organizationMembers", {
      userId: args.userId,
      organizationId: args.organizationId,
      role: args.role,
      isActive: true,
      joinedAt: now,
      invitedBy: args.invitedBy,
      createdAt: now,
      updatedAt: now,
    });
    
    return memberId;
  },
});

// Mutation to update member role
export const updateMemberRole = mutation({
  args: {
    memberId: v.id("organizationMembers"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new ConvexError("Member not found");
    }
    
    // Cannot change owner role
    if (member.role === "owner") {
      throw new ConvexError("Cannot change owner role");
    }
    
    await ctx.db.patch(args.memberId, {
      role: args.role,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Mutation to remove member from organization
export const removeMember = mutation({
  args: { memberId: v.id("organizationMembers") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new ConvexError("Member not found");
    }
    
    // Cannot remove owner
    if (member.role === "owner") {
      throw new ConvexError("Cannot remove organization owner");
    }
    
    await ctx.db.patch(args.memberId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

