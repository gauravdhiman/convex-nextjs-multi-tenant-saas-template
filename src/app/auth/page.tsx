"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn } = useAuthActions();

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
            onSubmit={(event) => {
              console.log("Form submitted!");
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              console.log("FormData entries:", Object.fromEntries(formData.entries()));
              console.log("Calling signIn...");
              void signIn("password", formData).then(() => {
                console.log("signIn completed successfully");
                // Add a fallback redirect in case middleware doesn't catch it
                setTimeout(() => {
                  console.log("Checking if we need to manually redirect...");
                  window.location.href = "/dashboard";
                }, 1000);
              }).catch((err) => {
                console.error("signIn failed:", err);
              });
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