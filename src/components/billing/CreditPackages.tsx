"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface CreditPackagesProps {
  organizationId: Id<"organizations">;
}

export default function CreditPackages({ organizationId }: CreditPackagesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const packages = useQuery(api.subscriptions.getCreditPackages);
  const createCheckout = useAction(api.subscriptions.createCreditCheckout);

  const handlePurchase = async (packageId: string) => {
    setIsLoading(packageId);
    try {
      // Find the package to get its details
      const creditPackage = packages?.find(p => p.packageId === packageId);
      if (!creditPackage) {
        throw new Error("Credit package not found");
      }

      const result = await createCheckout({
        organizationId,
        packageId,
        creditPackage: {
          packageId: creditPackage.packageId,
          name: creditPackage.name,
          stripePriceId: creditPackage.stripePriceId,
          credits: creditPackage.credits,
          price: creditPackage.price,
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

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat("en-US").format(credits);
  };

  const calculateRate = (credits: number, price: number) => {
    const ratePerCredit = price / credits;
    return (ratePerCredit / 100).toFixed(4); // Convert to dollars
  };

  if (!packages) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Purchase Additional Credits</h3>
        <p className="mt-1 text-sm text-gray-500">
          Buy credits to continue using our services when your subscription credits run out.
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const isPopular = pkg.packageId === "credits_1000";
            
            return (
              <div
                key={pkg.packageId}
                className={`relative rounded-lg border-2 p-4 ${
                  isPopular
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                } hover:shadow-md transition-shadow`}
              >
                {isPopular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">{pkg.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">{pkg.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-600">
                      {formatCredits(pkg.credits)} credits
                    </div>
                    <div className="text-xs text-gray-500">
                      ${calculateRate(pkg.credits, pkg.price)} per credit
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.packageId)}
                  disabled={isLoading === pkg.packageId}
                  className={`mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading === pkg.packageId ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Purchase"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">How Credits Work</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Credits are consumed when you use our services</li>
            <li>• Purchased credits never expire</li>
            <li>• Credits from subscriptions are added monthly/yearly</li>
            <li>• You can purchase additional credits anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}