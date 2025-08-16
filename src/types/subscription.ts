import { Id } from "../../convex/_generated/dataModel";

export interface Subscription {
  _id: Id<"subscriptions">;
  organizationId: Id<"organizations">;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  planId: string;
  status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionPlan {
  _id: Id<"subscriptionPlans">;
  planId: string;
  name: string;
  description: string;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  creditsIncluded: number;
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Credits {
  _id: Id<"credits">;
  organizationId: Id<"organizations">;
  balance: number;
  totalEarned: number;
  totalPurchased: number;
  totalBonus?: number;
  totalRefunded?: number;
  totalUsed: number;
  lastUpdated: number;
}

export interface CreditEntry {
  _id: Id<"creditEntries">;
  organizationId: Id<"organizations">;
  type: "earned" | "purchased" | "bonus" | "refunded";
  amount: number;
  remaining: number;
  description: string;
  expiresAt?: number;
  metadata?: {
    subscriptionId?: string;
    stripePaymentIntentId?: string;
    promotionCode?: string;
    referralId?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface CreditTransaction {
  _id: Id<"creditTransactions">;
  organizationId: Id<"organizations">;
  type: "earned" | "purchased" | "bonus" | "used" | "refunded" | "expired" | "adjustment";
  amount: number;
  description: string;
  metadata?: {
    subscriptionId?: string;
    stripePaymentIntentId?: string;
    serviceUsed?: string;
    userId?: Id<"users">;
    promotionCode?: string;
    referralId?: string;
  };
  createdAt: number;
}

export interface CreditPackage {
  _id: Id<"creditPackages">;
  packageId: string;
  name: string;
  description: string;
  stripePriceId: string;
  credits: number;
  price: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}