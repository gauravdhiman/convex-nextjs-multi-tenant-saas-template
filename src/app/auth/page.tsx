"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn } = useAuthActions();
  const router = useRouter();
  const currentUser = useQuery(api.users.viewer);

  // Debug authentication state
  useEffect(() => {
    // Show loading state while undefined
    if (currentUser === undefined) {
      return;
    }

    // Redirect if authenticated
    if (currentUser !== null) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Show loading while auth state is being determined
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to SaaS Template
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              try {
                const result = await signIn("password", formData);

                // If sign in was successful, wait a moment for auth state to update, then redirect
                if (result && result.signingIn) {
                  setTimeout(() => {
                    router.push("/dashboard");
                  }, 1000);
                }
              } catch (error) {
                console.error("Sign in error:", error);
              }
            }}
          >
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required={!isLogin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <input name="flow" type="hidden" value={isLogin ? "signIn" : "signUp"} />

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </main>
  );
}