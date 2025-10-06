/**
 * Utility functions for handling image URLs
 */

interface VehicleImage {
  url: string;
  is_primary?: boolean;
}

interface Vehicle {
  vehicle_images?: VehicleImage[];
}

/**
 * Constructs a full image URL by combining the API base URL with the image path
 * @param imagePath - The relative image path from the API (e.g., "/uploads/filename.jpg")
 * @returns The full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return "";

  const apiBaseUrlEnv = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // If the path already starts with http/https, return as is
  if (imagePath.startsWith('http')) return imagePath;

  // Normalize backslashes and ensure a single leading slash on the path
  let normalizedPath = imagePath.replace(/\\/g, '/');
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  // Normalize base URL (no trailing slash)
  const base = apiBaseUrlEnv.replace(/\/$/, '');

  // Combine base and path
  return `${base}${normalizedPath}`;
};

/**
 * Builds a profile image URL, supporting absolute Google URLs and providing a default fallback
 */
export const getProfileImageUrl = (profilePicture: string | undefined | null): string | undefined => {
  // Default avatar if none provided
  if (!profilePicture || `${profilePicture}`.trim() === "") {
    return "/profile-avatar.png";
  }

  // Google or any absolute URL
  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  // Otherwise, treat as relative and normalize via getImageUrl
  const url = getImageUrl(profilePicture);
  return url || "/profile-avatar.png";
};

/**
 * Gets the primary image from an array of vehicle images
 * @param images - Array of vehicle images
 * @returns The primary image or the first image if no primary is set
 */
export const getPrimaryImage = (images: VehicleImage[] | undefined): VehicleImage | null => {
  if (!images || images.length === 0) return null;
  return images.find(img => img.is_primary) || images[0];
};

/**
 * Gets the full URL for the primary image of a vehicle
 * @param vehicle - Vehicle object with vehicle_images array
 * @returns The full URL to the primary image, or empty string if no image
 */
export const getVehiclePrimaryImageUrl = (vehicle: Vehicle): string => {
  const primaryImage = getPrimaryImage(vehicle?.vehicle_images);
  return getImageUrl(primaryImage?.url);
};



