"use client";

import React from "react";
import FormHeader from "@/components/auth/FormHeader";
import LoginFormSection from "@/components/auth/login/LoginFormSection";
import FormActions from "@/components/auth/login/FormActions";
import SocialLoginSection from "@/components/auth/login/SocialLoginSection";
import { useLoginForm } from "@/hooks/login/useLoginForm";
import AnimatedAlert from "@/components/ui/AnimatedAlert";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

const Login = () => {
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

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-start justify-center bg-whitesmoke dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="w-full max-w-md">
          <FormHeader title="Sign in to Lakbay" />

          {/* Login Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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

export default Login;
