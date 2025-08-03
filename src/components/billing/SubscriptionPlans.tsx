"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface SubscriptionPlansProps {
  organizationId: Id<"organizations">;
  currentPlan?: string;
}

export default function SubscriptionPlans({ organizationId, currentPlan }: SubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = useQuery(api.subscriptions.getSubscriptionPlans);
  const createCheckout = useAction(api.subscriptions.createSubscriptionCheckout);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId);
    try {
      // Find the plan to get its details
      const plan = plans?.find(p => p.planId === planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      const result = await createCheckout({
        organizationId,
        planId,
        interval: billingInterval,
        plan: {
          planId: plan.planId,
          name: plan.name,
          stripePriceIdMonthly: plan.stripePriceIdMonthly,
          stripePriceIdYearly: plan.stripePriceIdYearly,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          creditsIncluded: plan.creditsIncluded,
        },
      });
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  if (!plans) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Select the perfect plan for your team's needs
        </p>
      </div>

      {/* Billing interval toggle */}
      <div className="mt-8 flex justify-center">
        <div className="relative bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval("month")}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingInterval === "month"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingInterval === "year"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
        {plans.map((plan) => {
          const price = billingInterval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
          const isCurrentPlan = currentPlan === plan.planId;
          const isPopular = plan.planId === "pro";

          return (
            <div
              key={plan.planId}
              className={`relative rounded-2xl border ${
                isPopular
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200"
              } bg-white p-8`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  <span className="text-gray-600">
                    /{billingInterval === "month" ? "month" : "year"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  {plan.creditsIncluded.toLocaleString()} credits included
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed cursor-pointer"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.planId)}
                    disabled={isLoading === plan.planId}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isPopular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading === plan.planId ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Get Started"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}