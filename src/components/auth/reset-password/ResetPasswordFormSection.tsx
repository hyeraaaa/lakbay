import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";

interface ResetPasswordFormSectionProps {
  formData: {
    newPassword: string;
    confirmPassword: string;
  };
  errors: { newPassword?: string; confirmPassword?: string };
  isLoading: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
}

const ResetPasswordFormSection: React.FC<ResetPasswordFormSectionProps> = ({
  formData,
  errors,
  isLoading,
  showNewPassword,
  showConfirmPassword,
  onInputChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
}) => {
  return (
    <div className="space-y-4">
      {/* New Password Field */}
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={onInputChange}
            className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onToggleNewPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={onInputChange}
            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordFormSection; 