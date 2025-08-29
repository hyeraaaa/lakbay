import React from "react";
import FormHeader from "@/components/auth/FormHeader";

interface SuccessHeaderProps {
  email: string;
}

const SuccessHeader: React.FC<SuccessHeaderProps> = ({ email }) => {
  return (
    <FormHeader 
      title="Check your email"
      subtitle={`We've sent a password reset link to ${email}`}
    />
  );
};

export default SuccessHeader; 