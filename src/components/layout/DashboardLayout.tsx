"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  
  const user = useQuery(api.users.viewer);
  const userOrganizations = useQuery(api.users.getUserOrganizations);
  
  const currentOrganization = userOrganizations?.[0];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const navigation = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: "📊",
      current: pathname === "/dashboard",
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: "💳",
      current: pathname === "/dashboard/billing",
    },
    {
      name: "Team",
      href: "/dashboard/team",
      icon: "👥",
      current: pathname === "/dashboard/team",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: "⚙️",
      current: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🚀</span>
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">SaaS App</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Organization info */}
            {currentOrganization && (
              <div className="border-t border-gray-200 p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Organization
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentOrganization.name}
                </div>
              </div>
            )}

            {/* Sign Out */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center cursor-pointer"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🚀</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">SaaS App</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Organization info */}
          {currentOrganization && (
            <div className="border-t border-gray-200 p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Organization
              </div>
              <div className="text-sm font-medium text-gray-900 truncate">
                {currentOrganization.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {userOrganizations?.length} member{userOrganizations?.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center cursor-pointer"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🚀</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">SaaS App</span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}