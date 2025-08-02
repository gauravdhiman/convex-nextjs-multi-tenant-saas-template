"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import SubscriptionStatus from "../../../components/billing/SubscriptionStatus";
import SubscriptionPlans from "../../../components/billing/SubscriptionPlans";
import CreditBalance from "../../../components/billing/CreditBalance";
import CreditPackages from "../../../components/billing/CreditPackages";
import CreditHistory from "../../../components/billing/CreditHistory";
import CreditUsageDemo from "../../../components/demo/CreditUsageDemo";
import SetupOrganization from "../../../components/setup/SetupOrganization";
import DashboardLayout from "../../../components/layout/DashboardLayout";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "credits" | "history" | "demo">("overview");
  
  // Get user's organizations to find a valid organization ID
  const userOrganizations = useQuery(api.users.getUserOrganizations);
  
  // Use the first organization the user has access to, or show a message if none
  const organizationId = userOrganizations?.[0]?._id;
  
  const subscription = useQuery(
    api.subscriptions.getOrganizationSubscription,
    organizationId ? { organizationId } : "skip"
  );

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "plans", name: "Plans", icon: "💳" },
    { id: "credits", name: "Credits", icon: "🪙" },
    { id: "history", name: "History", icon: "📋" },
    { id: "demo", name: "Demo", icon: "🧪" },
  ];

  // Show loading state while fetching organizations
  if (userOrganizations === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show setup screen if user has no organizations
  if (!userOrganizations || userOrganizations.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <SetupOrganization />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, credits, and billing information for{" "}
            <span className="font-medium">{userOrganizations[0]?.name}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {organizationId ? (
            <>
              {activeTab === "overview" && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SubscriptionStatus organizationId={organizationId} />
                    <CreditBalance organizationId={organizationId} />
                  </div>
                  
                  {(!subscription || subscription.status !== "active") && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Choose a Plan to Get Started
                      </h2>
                      <SubscriptionPlans 
                        organizationId={organizationId} 
                        currentPlan={subscription?.planId}
                      />
                    </div>
                  )}

                  <CreditPackages organizationId={organizationId} />
                </>
              )}

              {activeTab === "plans" && (
                <SubscriptionPlans 
                  organizationId={organizationId} 
                  currentPlan={subscription?.planId}
                />
              )}

              {activeTab === "credits" && (
                <div className="space-y-8">
                  <CreditBalance organizationId={organizationId} />
                  <CreditPackages organizationId={organizationId} />
                </div>
              )}

              {activeTab === "history" && (
                <CreditHistory organizationId={organizationId} />
              )}

              {activeTab === "demo" && (
                <div className="space-y-8">
                  <CreditBalance organizationId={organizationId} />
                  <CreditUsageDemo organizationId={organizationId} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Found</h3>
                <p className="text-gray-600">You need to be part of an organization to access billing features.</p>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {typeof window !== "undefined" && (
          <>
            {new URLSearchParams(window.location.search).get("subscription") === "success" && (
              <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your subscription has been activated.</span>
              </div>
            )}
            
            {new URLSearchParams(window.location.search).get("credits") === "success" && (
              <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your credits have been added.</span>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}