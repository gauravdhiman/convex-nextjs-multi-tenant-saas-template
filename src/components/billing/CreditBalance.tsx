"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface CreditBalanceProps {
  organizationId: Id<"organizations">;
}

export default function CreditBalance({ organizationId }: CreditBalanceProps) {
  const credits = useQuery(api.subscriptions.getOrganizationCredits, {
    organizationId,
  });

  if (credits === undefined) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 1000) return "text-green-600";
    if (balance > 100) return "text-yellow-600";
    return "text-red-600";
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 1000) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (balance > 100) {
      return (
        <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    return (
      <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Credit Balance</h3>
            <div className="mt-2 flex items-center">
              {getBalanceIcon(credits.balance)}
              <span className={`ml-2 text-3xl font-bold ${getBalanceColor(credits.balance)}`}>
                {formatNumber(credits.balance)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {credits.balance > 100 
                ? "You have plenty of credits" 
                : credits.balance > 0 
                ? "Running low on credits" 
                : "No credits remaining"}
            </p>
          </div>
        </div>

        {/* Credit usage breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {formatNumber(credits.totalEarned)}
            </div>
            <div className="text-sm text-gray-500">Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {formatNumber(credits.totalPurchased)}
            </div>
            <div className="text-sm text-gray-500">Purchased</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {formatNumber(credits.totalUsed)}
            </div>
            <div className="text-sm text-gray-500">Used</div>
          </div>
        </div>

        {/* Low balance warning */}
        {credits.balance < 100 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Credit Balance
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Consider purchasing additional credits to continue using our services.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}