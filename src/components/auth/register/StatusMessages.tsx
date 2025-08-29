import React from "react";
import Link from "next/link";

interface StatusMessagesProps {
  serverError: string | undefined;
  isSuccess: boolean;
}

const StatusMessages: React.FC<StatusMessagesProps> = ({ serverError, isSuccess }) => {
  return (
    <>
      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-2">
            We've sent you a verification link to your email. Please check your inbox and click the link to verify your account.
          </p>
          <Link 
            href="/login" 
            className="text-xs sm:text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 underline font-medium"
          >
            Click here to go to login
          </Link>
        </div>
      )}
    </>
  );
};

export default StatusMessages; 