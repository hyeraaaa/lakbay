import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";

interface PersonalInfoSectionProps {
  formData: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
  };
  errors: { [key: string]: string | undefined };
  isLoading: boolean;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
}

const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow backspace, delete, tab, escape, enter, and arrow keys
  if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true)) {
    return
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault()
  }
}

const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow backspace, delete, tab, escape, enter, and arrow keys
  if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true)) {
    return
  }
  // Prevent numeric keys (0-9) from both main keyboard and numpad
  if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
    e.preventDefault()
  }
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* First Name Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={onInputChange}
              onKeyDown={handleNameKeyDown}
              className={`pl-10 ${errors.first_name ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.first_name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={onInputChange}
              onKeyDown={handleNameKeyDown}
              className={`pl-10 ${errors.last_name ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.last_name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={onInputChange}
              className={`pl-10 ${errors.username ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
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
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
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

        {/* Phone Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm text-muted-foreground bg-muted">
              +63
            </span>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="9XXXXXXXXX"
              value={formData.phone.replace(/^\+63/, '')}
              onChange={onInputChange}
              onKeyDown={handlePhoneKeyDown}
              className={`rounded-l-none ${errors.phone ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Format: 9XXXXXXXXX (10 digits)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection; 