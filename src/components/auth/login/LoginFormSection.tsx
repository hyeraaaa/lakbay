import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

interface LoginFormSectionProps {
  formData: {
    email: string;
    password: string;
  };
  errors: { email?: string; password?: string };
  isLoading: boolean;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
}

const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  formData,
  errors,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Email Field */}
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={onInputChange}
            className={`pl-8 sm:pl-10 h-9 sm:h-10 text-sm ${errors.email ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={onInputChange}
            className={`pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-sm ${errors.password ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.password}</p>
        )}
      </div>

      {/* Forgot Password and Verify Email Links */}
      <div className="flex items-center justify-end">
        <Link
          href="/forgot-password"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default LoginFormSection; 