"use client";

interface SubscriptionSuccessMessageProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'subscription' | 'credits';
}

export default function SubscriptionSuccessMessage({ 
  isVisible, 
  onClose, 
  type 
}: SubscriptionSuccessMessageProps) {
  if (!isVisible) return null;

  const getMessage = () => {
    switch (type) {
      case 'subscription':
        return 'Your subscription has been activated successfully!';
      case 'credits':
        return 'Your credits have been added successfully!';
      default:
        return 'Operation completed successfully!';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline sm:ml-1">{getMessage()}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-green-700 hover:text-green-900 cursor-pointer text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}