"use client";

import React from "react";
import FormHeader from "@/components/auth/FormHeader";
import PersonalInfoSection from "@/components/auth/register/PersonalInfoSection";
import AddressInfoSection from "@/components/auth/register/AddressInfoSection";
import StatusMessages from "@/components/auth/register/StatusMessages";
import FormActions from "@/components/auth/register/FormActions";
import SocialLoginSection from "@/components/auth/register/SocialLoginSection";
import { useRegistrationForm } from "@/hooks/register/useRegistrationForm";
import AnimatedAlert from "@/components/ui/AnimatedAlert";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

const Register = () => {
  const {
    formData,
    showPassword,
    isLoading,
    errors,
    serverError,
    isSuccess,
    handleInputChange,
    handleSubmit,
    togglePassword,
  } = useRegistrationForm();

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-start justify-center pt-16 sm:pt-20 pb-16 sm:pb-20 px-4">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <FormHeader title="Join Lakbay" />

          {/* Register Form */}
          <div className="space-y-4 sm:space-y-6">
            <StatusMessages serverError={serverError} isSuccess={isSuccess} />

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

            <SocialLoginSection isLoading={isLoading} />
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

export default Register; 