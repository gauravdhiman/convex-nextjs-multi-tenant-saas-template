"use client";

import { useState } from "react";
import { useCredits } from "../../hooks/useCredits";
import { Id } from "../../../convex/_generated/dataModel";

interface CreditUsageDemoProps {
  organizationId: Id<"organizations">;
}

export default function CreditUsageDemo({ organizationId }: CreditUsageDemoProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  
  const { credits, useCreditsForService, hasEnoughCredits, getCreditStatus } = useCredits(organizationId);

  const handleTextGeneration = async () => {
    const creditsNeeded = 10;
    
    if (!hasEnoughCredits(creditsNeeded)) {
      setLastResult("❌ Not enough credits! You need at least 10 credits.");
      return;
    }

    setIsProcessing(true);
    try {
      await useCreditsForService(
        creditsNeeded,
        "AI Text Generation Demo",
        "text-generation"
      );
      setLastResult("✅ Successfully used 10 credits for text generation!");
    } catch (error) {
      setLastResult("❌ Failed to use credits. Please try again.");
      console.error("Credit usage error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageGeneration = async () => {
    const creditsNeeded = 25;
    
    if (!hasEnoughCredits(creditsNeeded)) {
      setLastResult("❌ Not enough credits! You need at least 25 credits.");
      return;
    }

    setIsProcessing(true);
    try {
      await useCreditsForService(
        creditsNeeded,
        "AI Image Generation Demo",
        "image-generation"
      );
      setLastResult("✅ Successfully used 25 credits for image generation!");
    } catch (error) {
      setLastResult("❌ Failed to use credits. Please try again.");
      console.error("Credit usage error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataAnalysis = async () => {
    const creditsNeeded = 50;
    
    if (!hasEnoughCredits(creditsNeeded)) {
      setLastResult("❌ Not enough credits! You need at least 50 credits.");
      return;
    }

    setIsProcessing(true);
    try {
      await useCreditsForService(
        creditsNeeded,
        "Data Analysis Demo",
        "data-analysis"
      );
      setLastResult("✅ Successfully used 50 credits for data analysis!");
    } catch (error) {
      setLastResult("❌ Failed to use credits. Please try again.");
      console.error("Credit usage error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-orange-600";
      case "empty": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "good": return "You have plenty of credits";
      case "medium": return "Credits are getting low";
      case "low": return "Running low on credits";
      case "empty": return "No credits remaining";
      default: return "Loading...";
    }
  };

  if (!credits) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Credit Usage Demo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Test different services that consume credits
        </p>
      </div>

      <div className="p-6">
        {/* Current Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Current Balance</h4>
              <p className="text-2xl font-bold text-gray-900">
                {credits.balance.toLocaleString()} credits
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${getStatusColor(getCreditStatus())}`}>
                {getStatusMessage(getCreditStatus())}
              </p>
            </div>
          </div>
        </div>

        {/* Service Buttons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">AI Text Generation</h4>
              <p className="text-sm text-gray-500">Generate AI-powered text content</p>
              <p className="text-xs text-gray-400">Cost: 10 credits</p>
            </div>
            <button
              onClick={handleTextGeneration}
              disabled={isProcessing || !hasEnoughCredits(10)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Use Service"}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">AI Image Generation</h4>
              <p className="text-sm text-gray-500">Create AI-generated images</p>
              <p className="text-xs text-gray-400">Cost: 25 credits</p>
            </div>
            <button
              onClick={handleImageGeneration}
              disabled={isProcessing || !hasEnoughCredits(25)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Use Service"}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Analysis</h4>
              <p className="text-sm text-gray-500">Advanced data processing and insights</p>
              <p className="text-xs text-gray-400">Cost: 50 credits</p>
            </div>
            <button
              onClick={handleDataAnalysis}
              disabled={isProcessing || !hasEnoughCredits(50)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Use Service"}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {lastResult && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{lastResult}</p>
          </div>
        )}

        {/* Low Credits Warning */}
        {getCreditStatus() === "low" && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Running Low on Credits
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Consider purchasing additional credits or upgrading your subscription to continue using our services.
                </p>
              </div>
            </div>
          </div>
        )}

        {getCreditStatus() === "empty" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  No Credits Remaining
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  You need to purchase credits or upgrade your subscription to use our services.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}