import React from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Building, Globe } from "lucide-react";

interface AddressInfoSectionProps {
  formData: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  errors: { [key: string]: string | undefined };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressInfoSection: React.FC<AddressInfoSectionProps> = ({
  formData,
  errors,
  isLoading,
  onInputChange,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Address Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Address Line 1 Field */}
        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
          <label htmlFor="address_line1" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Street Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="address_line1"
              name="address_line1"
              type="text"
              placeholder="Enter your street address"
              value={formData.address_line1}
              onChange={onInputChange}
              className={`pl-10 ${errors.address_line1 ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.address_line1 && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.address_line1}</p>
          )}
        </div>

        {/* City Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            City
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={onInputChange}
              className={`pl-10 ${errors.city ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.city && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>
          )}
        </div>

        {/* State Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            State/Province
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="state"
              name="state"
              type="text"
              placeholder="Enter your state"
              value={formData.state}
              onChange={onInputChange}
              className={`pl-10 ${errors.state ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.state && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.state}</p>
          )}
        </div>

        {/* Postal Code Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="postal_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Postal Code
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="postal_code"
              name="postal_code"
              type="text"
              placeholder="Enter postal code"
              value={formData.postal_code}
              onChange={onInputChange}
              className={`pl-10 ${errors.postal_code ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.postal_code && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.postal_code}</p>
          )}
        </div>

        {/* Country Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Country
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="country"
              name="country"
              type="text"
              placeholder="Enter your country"
              value={formData.country}
              onChange={onInputChange}
              className={`pl-10 ${errors.country ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.country && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressInfoSection; 