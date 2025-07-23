import { Id } from "../../convex/_generated/dataModel";

export interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  ownerId: Id<"users">;
  subscriptionId?: Id<"subscriptions">;
  settings: OrganizationSettings;
  createdAt: number;
  updatedAt: number;
}

export interface OrganizationSettings {
  allowUserInvites: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
}

export interface OrganizationMember {
  _id: Id<"organizationMembers">;
  organizationId: Id<"organizations">;
  userId: Id<"users">;
  role: "owner" | "admin" | "member";
  invitedBy?: Id<"users">;
  invitedAt?: number;
  joinedAt?: number;
  status: "active" | "invited" | "suspended";
}

export interface AuditLog {
  _id: Id<"auditLogs">;
  organizationId: Id<"organizations">;
  userId: Id<"users">;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
}