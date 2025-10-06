"use client";

import React, { useEffect } from "react";
import FormHeader from "@/components/auth/FormHeader";
import LoginFormSection from "@/components/auth/login/LoginFormSection";
import FormActions from "@/components/auth/login/FormActions";
import SocialLoginSection from "@/components/auth/login/SocialLoginSection";
import { useLoginForm } from "@/hooks/login/useLoginForm";
import { useNotification } from "@/components/NotificationProvider";

const Login = () => {
  const { error } = useNotification();
  const {
    formData,
    showPassword,
    isLoading,
    isGoogleLoading,
    errors,
    serverError,
    handleInputChange,
    togglePassword,
    handleSubmit,
    handleGoogleLogin,
  } = useLoginForm();

  // Show error notification when serverError changes
  useEffect(() => {
    if (serverError) {
      error(serverError);
    }
  }, [serverError, error]);

  return (
      <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <FormHeader title="Sign in to Lakbay" />

          {/* Login Form */}
          <div className="space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <LoginFormSection
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                showPassword={showPassword}
                onInputChange={handleInputChange}
                onTogglePassword={togglePassword}
              />

              <FormActions isLoading={isLoading} />
            </form>

            <SocialLoginSection 
              isLoading={isLoading}
              isGoogleLoading={isGoogleLoading}
              onGoogleLogin={handleGoogleLogin}
            />
          </div>
        </div>
      </div>
  );
};

export default Login;
