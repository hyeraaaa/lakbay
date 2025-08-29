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
            className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={onInputChange}
            className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
        )}
      </div>

      {/* Forgot Password and Verify Email Links */}
      <div className="flex items-center justify-between">
        <Link
          href="/email-verification"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Verify your email?
        </Link>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default LoginFormSection; 