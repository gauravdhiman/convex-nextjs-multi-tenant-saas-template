import { QueryCtx, MutationCtx } from "../_generated/server";
import { auth } from "../auth";
import { Id } from "../_generated/dataModel";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await auth.getUserIdentity(ctx);
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();

  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function getCurrentOrganization(
  ctx: QueryCtx | MutationCtx,
  organizationId?: Id<"organizations">
) {
  const user = await requireAuth(ctx);
  
  if (!organizationId) {
    // Get user's default organization (first one they're a member of)
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (!membership) {
      return null;
    }
    
    organizationId = membership.organizationId;
  }

  // Verify user has access to this organization
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization_user", (q) => 
      q.eq("organizationId", organizationId).eq("userId", user._id)
    )
    .filter((q) => q.eq(q.field("status"), "active"))
    .unique();

  if (!membership) {
    throw new Error("Access denied to organization");
  }

  const organization = await ctx.db.get(organizationId);
  if (!organization) {
    throw new Error("Organization not found");
  }

  return { organization, membership, user };
}

export async function requireOrganizationAccess(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  requiredRole?: "owner" | "admin" | "member"
) {
  const result = await getCurrentOrganization(ctx, organizationId);
  if (!result) {
    throw new Error("Organization access required");
  }

  const { membership } = result;

  if (requiredRole) {
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new Error(`${requiredRole} role required`);
    }
  }

  return result;
}