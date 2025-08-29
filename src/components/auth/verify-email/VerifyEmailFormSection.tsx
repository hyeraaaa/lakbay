import React from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface VerifyEmailFormSectionProps {
  formData: {
    email: string;
  };
  error?: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VerifyEmailFormSection: React.FC<VerifyEmailFormSectionProps> = ({
  formData,
  error,
  isLoading,
  onInputChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={onInputChange}
            className={`pl-10 ${error ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailFormSection; 