import { Id } from "../../convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  email: string;
  name: string;
  profilePicture?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthAccount {
  _id: Id<"authAccounts">;
  userId: Id<"users">;
  provider: string;
  providerAccountId: string;
  type: "oauth" | "email" | "credentials";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
}

export interface AuthSession {
  _id: Id<"authSessions">;
  userId: Id<"users">;
  sessionToken: string;
  expires: number;
}

export interface AuthVerificationToken {
  _id: Id<"authVerificationTokens">;
  identifier: string;
  token: string;
  expires: number;
}

export interface Session {
  _id: Id<"sessions">;
  userId: Id<"users">;
  organizationId?: Id<"organizations">;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: number;
  expiresAt: number;
  createdAt: number;
}