import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

interface SuccessMessageProps {
  email: string;
  resendTimer: number;
  isResending: boolean;
  onResend: () => void;
  onTryAnotherEmail: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  email,
  resendTimer,
  isResending,
  onResend,
  onTryAnotherEmail,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          Click the link in the email to verify your account. The link will expire in 24 hours.
        </p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={onResend}
              disabled={resendTimer > 0 || isResending}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "resend it"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <Button
          onClick={onTryAnotherEmail}
          variant="outline"
          className="w-full"
        >
          Try another email
        </Button>
        
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage; 