"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface SubscriptionStatusProps {
  organizationId: Id<"organizations">;
}

export default function SubscriptionStatus({ organizationId }: SubscriptionStatusProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const subscription = useQuery(api.subscriptions.getOrganizationSubscription, {
    organizationId,
  });
  const cancelSubscription = useAction(api.subscriptions.cancelSubscription);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription({
        organizationId,
        cancelAtPeriodEnd,
      });
      setShowCancelDialog(false);
      // Optionally show success message
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      case "incomplete":
        return "Incomplete";
      case "incomplete_expired":
        return "Expired";
      case "unpaid":
        return "Unpaid";
      default:
        return status;
    }
  };

  if (subscription === undefined) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Subscription</h3>
          <p className="mt-1 text-sm text-gray-500">
            Subscribe to a plan to start using our services with included credits.
          </p>
        </div>
      </div>
    );
  }

  const { plan } = subscription;

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {getStatusText(subscription.status)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{plan?.name}</h4>
              <p className="mt-1 text-sm text-gray-600">{plan?.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Credits per period:</span>
                  <span className="font-medium">{plan?.creditsIncluded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current period:</span>
                  <span className="font-medium">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {subscription.trialEnd && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trial ends:</span>
                    <span className="font-medium">{formatDate(subscription.trialEnd)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h5>
              <ul className="space-y-2">
                {plan?.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cancellation warning */}
          {subscription.cancelAtPeriodEnd && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Subscription Ending
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                    You'll lose access to premium features and won't receive new credits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* Cancel subscription dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cancelAtPeriodEnd}
                  onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Cancel at the end of current billing period ({formatDate(subscription.currentPeriodEnd)})
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Canceling..." : "Cancel Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}