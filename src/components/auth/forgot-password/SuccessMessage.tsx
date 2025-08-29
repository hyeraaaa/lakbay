import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
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
      {/* Success Message */}
      <div className="text-center space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 text-sm">
            If an account with that email exists, you'll receive a password reset link shortly.
          </p>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the email? Check your spam folder or try again.
        </p>

        {/* Resend Button with Timer */}
        <div className="space-y-3">
          <Button
            onClick={onResend}
            disabled={resendTimer > 0 || isResending}
            variant="outline"
            className="w-full h-9"
          >
            {isResending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Resending...
              </div>
            ) : resendTimer > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Resend available in {resendTimer}s
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Resend link
              </div>
            )}
          </Button>
          
          {resendTimer === 0 && !isResending && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can request another link now
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onTryAnotherEmail}
          className="w-full h-9"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Try another email
        </Button>
        
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full h-9"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessMessage; 