"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SubscriptionVerificationResult {
  status: 'checking' | 'success' | 'failed' | 'timeout';
  subscription?: any;
  message: string;
}

export function useSubscriptionVerification(
  organizationId: Id<"organizations"> | undefined,
  shouldVerify: boolean,
  maxWaitTime: number = 30000 // 30 seconds
): SubscriptionVerificationResult {
  const [verificationStatus, setVerificationStatus] = useState<SubscriptionVerificationResult>({
    status: 'checking',
    message: 'Verifying your subscription...'
  });

  const subscription = useQuery(
    api.subscriptions.getOrganizationSubscription,
    organizationId && shouldVerify ? { organizationId } : "skip"
  );

  useEffect(() => {
    if (!shouldVerify || !organizationId) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = maxWaitTime / 2000; // Poll every 2 seconds

    const checkSubscription = () => {
      pollCount++;

      if (subscription && subscription.status === 'active') {
        setVerificationStatus({
          status: 'success',
          subscription,
          message: 'Subscription activated successfully!'
        });
        return;
      }

      if (subscription && subscription.status !== 'active') {
        setVerificationStatus({
          status: 'failed',
          subscription,
          message: `Subscription status: ${subscription.status}. Please contact support.`
        });
        return;
      }

      if (pollCount >= maxPolls) {
        setVerificationStatus({
          status: 'timeout',
          message: 'Subscription verification timed out. Please refresh the page or contact support.'
        });
        return;
      }

      // Continue polling
      timeoutId = setTimeout(checkSubscription, 2000);
    };

    // Start checking immediately
    checkSubscription();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [subscription, shouldVerify, organizationId, maxWaitTime]);

  return verificationStatus;
}