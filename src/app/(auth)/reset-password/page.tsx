"use client";

import React, { useEffect } from "react";
import FormHeader from "@/components/auth/FormHeader";
import ResetPasswordFormSection from "@/components/auth/reset-password/ResetPasswordFormSection";
import FormActions from "@/components/auth/reset-password/FormActions";
import SuccessMessage from "@/components/auth/reset-password/SuccessMessage";
import { useResetPasswordForm } from "@/hooks/reset-password/useResetPasswordForm";
import { useNotification } from "@/components/NotificationProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const { error } = useNotification();
  const {
    formData,
    showNewPassword,
    showConfirmPassword,
    isLoading,
    errors,
    serverError,
    isSuccess,
    token,
    handleInputChange,
    toggleNewPassword,
    toggleConfirmPassword,
    handleSubmit,
    handleRedirectToLogin,
  } = useResetPasswordForm();

  // Show error notification when serverError changes
  useEffect(() => {
    if (serverError) {
      error(serverError);
    }
  }, [serverError, error]);

  // Show error if no token is provided
  if (!token) {
    return (
        <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
          <div className="w-full max-w-md">
            <FormHeader 
              title="Invalid Reset Link" 
              subtitle="This password reset link is invalid or has expired"
            />
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The password reset link you&apos;re trying to use is invalid or has expired. 
                Please request a new password reset from the login page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
    );
  }

  if (isSuccess) {
    return (
        <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
          <div className="w-full max-w-md">
            <FormHeader 
              title="Password Reset" 
            />
            <SuccessMessage onRedirectToLogin={handleRedirectToLogin} />
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="w-full max-w-md">
          <FormHeader 
            title="Reset Your Password" 
            subtitle="Enter your new password below"
          />

          {/* Reset Password Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <ResetPasswordFormSection
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                onInputChange={handleInputChange}
                onToggleNewPassword={toggleNewPassword}
                onToggleConfirmPassword={toggleConfirmPassword}
              />

              <FormActions isLoading={isLoading} />
            </form>
          </div>
        </div>
      </div>
  );
};

export default ResetPassword;