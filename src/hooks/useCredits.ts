"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useCredits(organizationId: Id<"organizations">) {
  const credits = useQuery(api.subscriptions.getOrganizationCredits, {
    organizationId,
  });

  const consumeCredits = useMutation(api.subscriptions.consumeCredits);

  const useCreditsForService = async (
    amount: number,
    description: string,
    serviceUsed?: string
  ) => {
    try {
      const result = await consumeCredits({
        organizationId,
        amount,
        description,
        serviceUsed,
      });
      return result;
    } catch (error) {
      console.error("Failed to consume credits:", error);
      throw error;
    }
  };

  const hasEnoughCredits = (amount: number) => {
    return credits ? credits.balance >= amount : false;
  };

  const getCreditStatus = () => {
    if (!credits) return "loading";
    if (credits.balance === 0) return "empty";
    if (credits.balance < 100) return "low";
    if (credits.balance < 1000) return "medium";
    return "good";
  };

  return {
    credits,
    useCreditsForService,
    hasEnoughCredits,
    getCreditStatus,
    isLoading: credits === undefined,
  };
}