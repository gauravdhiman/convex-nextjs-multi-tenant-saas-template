"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";

export default function TeamPage() {
  const userOrganizations = useQuery(api.users.getUserOrganizations);
  const currentOrganization = userOrganizations?.[0];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-gray-600">
            Manage your team members and their permissions
          </p>
        </div>

        {/* Current Organization */}
        {currentOrganization && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {currentOrganization.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Organization members and their roles
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
                  <p className="text-sm text-gray-500">
                    People who have access to this organization
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                  Invite Member
                </button>
              </div>

              {/* Team member list placeholder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">You</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">You (Owner)</p>
                      <p className="text-sm text-gray-500">Full access to organization</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Owner
                  </span>
                </div>

                {/* Placeholder for future team members */}
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No team members yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Invite team members to collaborate on your organization.
                  </p>
                  <div className="mt-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                      Invite Your First Team Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Roles & Permissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Roles & Permissions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Different access levels for your team
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">👑</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Owner</h4>
                    <p className="text-sm text-gray-500">
                      Full access to organization settings, billing, and team management
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Admin</h4>
                    <p className="text-sm text-gray-500">
                      Can manage team members and organization settings
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">👤</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Member</h4>
                    <p className="text-sm text-gray-500">
                      Can access organization resources and collaborate
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 text-sm">👁️</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Viewer</h4>
                    <p className="text-sm text-gray-500">
                      Read-only access to organization resources
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Team Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how your team works together
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Allow User Invites</h4>
                    <p className="text-sm text-gray-500">
                      Let team members invite others to the organization
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Require Email Verification</h4>
                    <p className="text-sm text-gray-500">
                      New members must verify their email before joining
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Session Timeout</h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="60">1 hour</option>
                    <option value="480">8 hours</option>
                    <option value="1440">24 hours</option>
                    <option value="10080">7 days</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    How long team members stay logged in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            🚧 Coming Soon
          </h3>
          <p className="text-blue-700">
            Team management features are currently in development. You'll soon be able to invite team members, 
            manage permissions, and collaborate more effectively.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}