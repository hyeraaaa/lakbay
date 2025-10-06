export const useProfilePicture = () => {
  // Construct profile picture URL
  const getProfilePictureUrl = (profilePicture: string | undefined | null): string | undefined => {
    if (!profilePicture) {
      return undefined;
    }
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // If profilePicture already contains the full URL, return as is
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    // Handle different path formats
    let imagePath = profilePicture;
    
    // If the path doesn't start with '/', add it
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    
    // Construct the full URL
    const fullUrl = `${API_BASE_URL}${imagePath}`;
    return fullUrl;
  };

  return {
    getProfilePictureUrl
  };
};
