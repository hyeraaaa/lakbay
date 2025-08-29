import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  onRedirectToLogin: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onRedirectToLogin }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>
      <Button
        onClick={onRedirectToLogin}
        className="w-full h-9 text-base font-medium"
      >
        <div className="flex items-center gap-2">
          Go to Login
          <ArrowRight className="h-4 w-4" />
        </div>
      </Button>
    </div>
  );
};

export default SuccessMessage; 