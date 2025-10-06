import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  userId: string;
  userType: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  user_type: string;
  is_verified: boolean;
  is_email_verified: boolean;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  two_fa_enabled?: boolean;
  created_at?: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Token management functions
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const hasClientAccessToken = (): boolean => {
  return !!getAccessToken();
};


export const setTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

// Token validation functions
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 2): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    const thresholdSeconds = thresholdMinutes * 60;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    console.log(`Token expiry check: ${timeUntilExpiry}s until expiry, threshold: ${thresholdSeconds}s`);
    
    return timeUntilExpiry < thresholdSeconds;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

// Token refresh function
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  try {
    console.log('Starting client-side token refresh');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Refresh endpoint:', `${API_BASE_URL}/api/auth/refresh-token`);
    
    // Server reads the httpOnly refresh token cookie
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    console.log('Server response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error response:', errorText);
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const tokens: AuthTokens = { accessToken: data.accessToken };
    console.log('New access token received, updating storage');
    setTokens(tokens);
    return tokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    clearUser();
    return null;
  }
};

// Special function for FormData uploads to avoid structuredClone issues
export const uploadFormData = async (
  url: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getAccessToken();
  
  // Check if token is expired or expiring soon
  if (accessToken && isTokenExpiringSoon(accessToken)) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      accessToken = newTokens.accessToken;
    } else {
      throw new Error('Authentication required');
    }
  }

  // Add authorization header if token exists
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Create request options manually to avoid cloning FormData
  const requestOptions: RequestInit = {
    method: options.method || 'POST',
    headers,
    body: formData,
  };

  // Copy other properties manually (excluding body and headers which we've already handled)
  if (options.mode) requestOptions.mode = options.mode;
  if (options.credentials) requestOptions.credentials = options.credentials;
  if (options.cache) requestOptions.cache = options.cache;
  if (options.redirect) requestOptions.redirect = options.redirect;
  if (options.referrer) requestOptions.referrer = options.referrer;
  if (options.integrity) requestOptions.integrity = options.integrity;
  if (options.keepalive) requestOptions.keepalive = options.keepalive;
  if (options.signal) requestOptions.signal = options.signal;

  // Make the request directly without any cloning
  const response = await fetch(url, requestOptions);

  // Handle 401 responses
  if (response.status === 401) {
    clearTokens();
    clearUser();
    throw new Error('Authentication required');
  }

  return response;
};

export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getAccessToken();
  
  // Check if token is expired or expiring soon
  if (accessToken && isTokenExpiringSoon(accessToken)) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      accessToken = newTokens.accessToken;
    } else {
      // Refresh failed, let the component handle the redirect
      throw new Error('Authentication required');
    }
  }

  // Add authorization header if token exists
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Create request options manually to avoid cloning issues
  const requestOptions: RequestInit = {
    method: options.method,
    headers,
    body: options.body,
  };

  // Copy other properties manually (excluding body and headers which we've already handled)
  if (options.mode) requestOptions.mode = options.mode;
  if (options.credentials) requestOptions.credentials = options.credentials;
  if (options.cache) requestOptions.cache = options.cache;
  if (options.redirect) requestOptions.redirect = options.redirect;
  if (options.referrer) requestOptions.referrer = options.referrer;
  if (options.integrity) requestOptions.integrity = options.integrity;
  if (options.keepalive) requestOptions.keepalive = options.keepalive;
  if (options.signal) requestOptions.signal = options.signal;

  // Make the request
  const response = await fetch(url, requestOptions);

  // Handle 401 responses
  if (response.status === 401) {
    clearTokens();
    clearUser();
    throw new Error('Authentication required');
  }

  return response;
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Invalidate refresh token cookie server-side
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
    clearUser();
    // Let the component handle the redirect instead of hardcoded redirect
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = getAccessToken();
  return accessToken ? isTokenValid(accessToken) : false;
};

// Get current user info
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) {
    return null;
  }
  return getUser();
}; 