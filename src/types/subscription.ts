import { Id } from "../../convex/_generated/dataModel";

export interface Subscription {
  _id: Id<"subscriptions">;
  organizationId: Id<"organizations">;
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  paymentMethodId?: string;
  externalSubscriptionId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
}