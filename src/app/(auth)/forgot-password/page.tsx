"use client";

import React from "react";
import FormHeader from "@/components/auth/FormHeader";
import ForgotPasswordFormSection from "@/components/auth/forgot-password/ForgotPasswordFormSection";
import FormActions from "@/components/auth/forgot-password/FormActions";
import BackToLogin from "@/components/auth/forgot-password/BackToLogin";
import SuccessHeader from "@/components/auth/forgot-password/SuccessHeader";
import SuccessMessage from "@/components/auth/forgot-password/SuccessMessage";
import { useForgotPasswordForm } from "@/hooks/forgot-password/useForgotPasswordForm";

const ForgotPassword = () => {
  const {
    formData,
    isLoading,
    isSubmitted,
    error,
    resendTimer,
    isResending,
    handleInputChange,
    handleSubmit,
    handleResend,
    resetForm,
  } = useForgotPasswordForm();

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
      <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 pt-20">
        <div className="w-full max-w-md">
          <FormHeader 
            title="Forgot your password?" 
            subtitle="No worries! Enter your email and we'll send you reset instructions."
          />

          {/* Forgot Password Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <ForgotPasswordFormSection
                formData={formData}
                error={error}
                isLoading={isLoading}
                onInputChange={handleInputChange}
              />

              <FormActions isLoading={isLoading} />
            </form>

            <BackToLogin />
          </div>
        </div>
      </div>
  );
};

export default ForgotPassword; 