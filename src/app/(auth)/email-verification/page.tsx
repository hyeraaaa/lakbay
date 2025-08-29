"use client";

import React from "react";
import FormHeader from "@/components/auth/FormHeader";
import VerifyEmailFormSection from "@/components/auth/verify-email/VerifyEmailFormSection";
import FormActions from "@/components/auth/verify-email/FormActions";
import BackToLogin from "@/components/auth/verify-email/BackToLogin";
import SuccessHeader from "@/components/auth/verify-email/SuccessHeader";
import SuccessMessage from "@/components/auth/verify-email/SuccessMessage";
import { useVerifyEmailForm } from "@/hooks/verify-email/useVerifyEmailForm";
import AnimatedAlert from "@/components/ui/AnimatedAlert";

const EmailVerification = () => {
  const {
    formData,
    isLoading,
    isSubmitted,
    validationError,
    apiError,
    resendTimer,
    isResending,
    handleInputChange,
    handleSubmit,
    handleResend,
    resetForm,
  } = useVerifyEmailForm();

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="w-full max-w-md">
          <SuccessHeader email={formData.email} />
          <SuccessMessage
            email={formData.email}
            resendTimer={resendTimer}
            isResending={isResending}
            onResend={handleResend}
            onTryAnotherEmail={resetForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 pt-20">
      <div className="w-full max-w-md">
        <FormHeader 
          title="Verify your email" 
          subtitle="Enter your email address and we'll send you a verification link."
        />

        {/* Verify Email Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <VerifyEmailFormSection
              formData={formData}
              error={validationError}
              isLoading={isLoading}
              onInputChange={handleInputChange}
            />

            <FormActions isLoading={isLoading} />
          </form>

          <BackToLogin />
        </div>
      </div>

      {/* API Error Alert */}
      <AnimatedAlert 
        message={apiError || ""}
        variant="destructive"
        position="bottom-right"
        autoClose={true}
        autoCloseDelay={2500}
      />
    </div>
  );
};

export default EmailVerification;