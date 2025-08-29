"use client";

import React from "react";
import FormHeader from "@/components/auth/FormHeader";
import ResetPasswordFormSection from "@/components/auth/reset-password/ResetPasswordFormSection";
import FormActions from "@/components/auth/reset-password/FormActions";
import SuccessMessage from "@/components/auth/reset-password/SuccessMessage";
import { useResetPasswordForm } from "@/hooks/reset-password/useResetPasswordForm";
import AnimatedAlert from "@/components/ui/AnimatedAlert";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

const ResetPassword = () => {
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

  // Show error if no token is provided
  if (!token) {
    return (
      <RedirectIfAuthenticated>
        <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
          <div className="w-full max-w-md">
            <FormHeader 
              title="Invalid Reset Link" 
              subtitle="This password reset link is invalid or has expired"
            />
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The password reset link you're trying to use is invalid or has expired. 
                Please request a new password reset from the login page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </RedirectIfAuthenticated>
    );
  }

  if (isSuccess) {
    return (
      <RedirectIfAuthenticated>
        <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
          <div className="w-full max-w-md">
            <FormHeader 
              title="Password Reset" 
            />
            <SuccessMessage onRedirectToLogin={handleRedirectToLogin} />
          </div>
        </div>
      </RedirectIfAuthenticated>
    );
  }

  return (
    <RedirectIfAuthenticated>
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

        {/* API Error Alert */}
        <AnimatedAlert 
          message={serverError || ""}
          variant="destructive"
          position="bottom-right"
          autoClose={true}
          autoCloseDelay={2500}
        />
      </div>
    </RedirectIfAuthenticated>
  );
};

export default ResetPassword;