"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const currentUser = useQuery(api.users.viewer);
  const createOrganization = useMutation(api.organizations.createOrganization);

  useEffect(() => {
    const completeSetup = async () => {
      // Check if user is authenticated
      if (currentUser === undefined) {
        return; // Still loading
      }
      
      if (currentUser === null) {
        // Not authenticated, redirect to auth
        router.push("/auth");
        return;
      }

      try {
        // Get signup data from sessionStorage
        const signupDataStr = sessionStorage.getItem("signupData");
        if (!signupDataStr) {
          // No signup data, redirect to dashboard
          router.push("/dashboard");
          return;
        }

        const signupData = JSON.parse(signupDataStr);
        
        // Create organization if data provided
        if (signupData.organizationName && signupData.organizationSlug) {
          await createOrganization({
            name: signupData.organizationName,
            slug: signupData.organizationSlug,
            description: signupData.organizationDescription || undefined,
            website: signupData.organizationWebsite || undefined,
            ownerId: currentUser._id,
          });
        }

        // Clear signup data
        sessionStorage.removeItem("signupData");
        
        // Redirect to dashboard
        router.push("/dashboard");
        
      } catch (err) {
        console.error("Setup error:", err);
        setError(err instanceof Error ? err.message : "Setup failed");
        setIsLoading(false);
      }
    };

    completeSetup();
  }, [currentUser, createOrganization, router]);

  if (currentUser === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Setting up your account...</h2>
          <p className="text-gray-600">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Setup Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}