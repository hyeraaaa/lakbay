"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import AnimatedAlert from "@/components/ui/AnimatedAlert";
import { useVerifyEmail } from '@/hooks/email-verification/useEmailVerification';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { status, errorMessage } = useVerifyEmail(token);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirectToLogin = () => {
    setIsRedirecting(true);
    router.push('/login');
  };

  const handleResendVerification = () => router.push('/email-verification');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Verifying your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md text-center">
        {status === 'success' ? (
          <div className="flex flex-col items-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your email address has been verified successfully. You can now access all features of your account.
            </p>
            <Button 
              onClick={handleRedirectToLogin}
              disabled={isRedirecting}
              className="w-full"
              size="lg"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Sign In to Your Account'
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{errorMessage}</p>
            <div className="space-y-3 w-full">
              <Button onClick={handleResendVerification} variant="outline" className="w-full" size="lg">
                Resend Verification Email
              </Button>
              <Button onClick={handleRedirectToLogin} variant="secondary" className="w-full" size="lg">
                Back to Sign In
              </Button>
            </div>
          </div>
        )}
      </div>

      {status === 'error' && (
        <AnimatedAlert 
          message={errorMessage}
          variant="destructive"
          position="bottom-right"
          autoClose
          autoCloseDelay={5000}
        />
      )}
    </div>
  );
};

export default VerifyEmail;
