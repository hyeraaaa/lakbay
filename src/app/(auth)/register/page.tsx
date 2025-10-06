"use client";

import React, { useEffect } from "react";
import FormHeader from "@/components/auth/FormHeader";
import PersonalInfoSection from "@/components/auth/register/PersonalInfoSection";
import AddressInfoSection from "@/components/auth/register/AddressInfoSection";
import FormActions from "@/components/auth/register/FormActions";
import SocialLoginSection from "@/components/auth/register/SocialLoginSection";
import { useRegistrationForm } from "@/hooks/register/useRegistrationForm";
import { useNotification } from "@/components/NotificationProvider";

const Register = () => {
  const { success, error } = useNotification();
  const {
    formData,
    showPassword,
    isLoading,
    isGoogleLoading,
    errors,
    serverError,
    isSuccess,
    handleInputChange,
    handleSubmit,
    togglePassword,
    handleGoogleLogin,
    clearSuccess,
  } = useRegistrationForm();

  // Show notifications when serverError or isSuccess changes
  useEffect(() => {
    if (isSuccess) {
      success("Account created successfully! We've sent you a verification link to your email. Redirecting to login.");
    }
  }, [isSuccess, success]);

  useEffect(() => {
    if (serverError) {
      error(serverError);
    }
  }, [serverError, error]);

  // Handle success redirect
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, clearSuccess]);

  return (
      <div className="min-h-screen flex items-start justify-center pt-16 sm:pt-20 pb-16 sm:pb-20 px-4">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <FormHeader title="Join Lakbay" />

          {/* Register Form */}
          <div className="space-y-4 sm:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <PersonalInfoSection
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                showPassword={showPassword}
                onInputChange={handleInputChange}
                onTogglePassword={togglePassword}
              />

              <AddressInfoSection
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                onInputChange={handleInputChange}
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

export default Register; 