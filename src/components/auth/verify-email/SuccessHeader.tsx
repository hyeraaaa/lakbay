import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessHeaderProps {
  email: string;
}

const SuccessHeader: React.FC<SuccessHeaderProps> = ({ email }) => {
  return (
    <div className="text-center space-y-3 mb-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Check your email
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-gray-900 dark:text-white">{email}</span>
      </p>
    </div>
  );
};

export default SuccessHeader; 