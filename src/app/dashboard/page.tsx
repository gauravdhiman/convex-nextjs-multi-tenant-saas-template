"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { AccountLinkingCheck } from "../../components/auth/AccountLinkingCheck";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Link from "next/link";

export default function DashboardPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const currentUser = useQuery(api.users.viewer);
  const userOrganizations = useQuery(api.users.getUserOrganizations);
  const currentOrganization = userOrganizations?.[0];
  
  // Get organization credits if we have an organization
  const credits = useQuery(
    api.subscriptions.getOrganizationCredits,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );
  
  // Get organization subscription if we have an organization
  const subscription = useQuery(
    api.subscriptions.getOrganizationSubscription,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  if (currentUser === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.name || currentUser?.email}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        <AccountLinkingCheck />

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.name || "User"}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {currentUser?.email || "No email"}
                      </dd>
                      {currentUser?.phone && (
                        <dd className="text-sm text-gray-500">
                          {currentUser.phone}
                        </dd>
                      )}
                      {currentUser?.timezone && (
                        <dd className="text-sm text-gray-500">
                          {currentUser.timezone}
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className={`h-8 w-8 ${currentUser?.emailVerificationTime ? 'text-green-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Email Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentUser?.emailVerificationTime ? "Verified" : "Unverified"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Organization
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userOrganizations && userOrganizations.length > 0 ? userOrganizations[0]?.name : "No organization"}
                      </dd>
                      {userOrganizations && userOrganizations.length > 0 && (
                        <>
                          <dd className="text-sm text-gray-500">
                            Role: {userOrganizations[0]?.role}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            /{userOrganizations[0]?.slug}
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 2FA Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className={`h-8 w-8 ${currentUser?.twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Two-Factor Auth
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentUser?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          {userOrganizations && userOrganizations.length > 0 && (
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-500">Name:</dt>
                          <dd className="text-sm font-medium text-gray-900">{userOrganizations[0]?.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Slug:</dt>
                          <dd className="text-sm font-medium text-gray-900">/{userOrganizations[0]?.slug}</dd>
                        </div>
                        {userOrganizations[0]?.description && (
                          <div>
                            <dt className="text-sm text-gray-500">Description:</dt>
                            <dd className="text-sm font-medium text-gray-900">{userOrganizations[0]?.description}</dd>
                          </div>
                        )}
                        {userOrganizations[0]?.website && (
                          <div>
                            <dt className="text-sm text-gray-500">Website:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              <a href={userOrganizations[0]?.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                                {userOrganizations[0]?.website}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Settings</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-500">Status:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userOrganizations[0]?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {userOrganizations[0]?.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Created:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {userOrganizations[0]?.createdAt ? new Date(userOrganizations[0].createdAt).toLocaleDateString() : 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Your Role:</dt>
                          <dd className="text-sm font-medium text-gray-900 capitalize">{userOrganizations[0]?.role}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Coming Soon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-600">Organization Management</span>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-gray-600">Subscription Billing</span>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-gray-600">Team Collaboration</span>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-gray-600">Analytics Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}