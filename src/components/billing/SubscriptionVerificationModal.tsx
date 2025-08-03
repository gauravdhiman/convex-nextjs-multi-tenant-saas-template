"use client";

import { useSubscriptionVerification } from "../../hooks/useSubscriptionVerification";
import { Id } from "../../../convex/_generated/dataModel";

interface SubscriptionVerificationModalProps {
  organizationId: Id<"organizations"> | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionVerificationModal({
  organizationId,
  isOpen,
  onClose,
  onSuccess
}: SubscriptionVerificationModalProps) {
  const verification = useSubscriptionVerification(organizationId, isOpen);

  // Auto-close on success
  if (verification.status === 'success' && isOpen) {
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  }

  if (!isOpen) return null;

  const getIcon = () => {
    switch (verification.status) {
      case 'checking':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'timeout':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (verification.status) {
      case 'checking':
        return 'Verifying Subscription';
      case 'success':
        return 'Subscription Activated!';
      case 'failed':
        return 'Subscription Issue';
      case 'timeout':
        return 'Verification Timeout';
    }
  };

  const getButtonText = () => {
    switch (verification.status) {
      case 'checking':
        return 'Please wait...';
      case 'success':
        return 'Continue';
      case 'failed':
        return 'Contact Support';
      case 'timeout':
        return 'Refresh Page';
    }
  };

  const handleButtonClick = () => {
    switch (verification.status) {
      case 'success':
        onSuccess();
        onClose();
        break;
      case 'failed':
        // Could open support chat or redirect to support page
        window.open('mailto:support@yourapp.com', '_blank');
        break;
      case 'timeout':
        window.location.reload();
        break;
      default:
        // Do nothing for 'checking' state
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          {getIcon()}
          
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {getTitle()}
          </h3>
          
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              {verification.message}
            </p>
            
            {verification.status === 'checking' && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  This usually takes a few seconds...
                </p>
              </div>
            )}
          </div>
          
          <div className="items-center px-4 py-3">
            <button
              onClick={handleButtonClick}
              disabled={verification.status === 'checking'}
              className={`px-4 py-2 text-white text-base font-medium rounded-md w-full shadow-sm cursor-pointer ${
                verification.status === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : verification.status === 'failed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : verification.status === 'timeout'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {getButtonText()}
            </button>
            
            {verification.status !== 'checking' && (
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}