'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  AuthTokens,
  isAuthenticated,
  getCurrentUser,
  setTokens,
  setUser,
  clearTokens,
  clearUser,
  logout as logoutUtil,
  refreshAccessToken,
  isTokenExpiringSoon,
  getAccessToken,
  getUser,
  hasClientAccessToken,
} from '@/lib/jwt';
import { profileService } from '@/services/profileServices';

interface JWTContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

const JWTContext = createContext<JWTContextType | undefined>(undefined);

interface JWTProviderProps {
  children: ReactNode;
}

export const JWTProvider: React.FC<JWTProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVerifyingRoute, setIsVerifyingRoute] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lastVerifiedPathRef = React.useRef<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUserState(currentUser);
          } else {
            // User data is missing, clear everything
            clearTokens();
            clearUser();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
        clearUser();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Only initialize once
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const login = useCallback((tokens: AuthTokens, userData: User) => {
    setTokens(tokens);
    setUser(userData);
    setUserState(userData);
    setIsLoading(false); // Ensure loading state is cleared after login
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logoutUtil();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server call fails, proceed to client-side cleanup
    } finally {
      // Perform client-side cleanup and then navigate
      clearTokens();
      clearUser();
      setUserState(null);
      router.replace('/login');
      setIsLoggingOut(false);
      // Keep isLoggingOut true until navigation happens; optionally reset later
    }
  }, [router]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('JWT Context: Starting token refresh...');
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        console.log('JWT Context: Token refresh successful');
        // Update user state if needed
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUserState(currentUser);
        }
        return true;
      }
      console.log('JWT Context: Token refresh returned null');
      return false;
    } catch (error) {
      console.error('JWT Context: Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = async () => {
      const accessToken = getAccessToken();
      if (accessToken && isTokenExpiringSoon(accessToken, 5)) {
        // Token expires in less than 5 minutes, refresh it
        await refreshToken();
      }
    };

    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUserState(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates } as User;
      setUser(merged);
      return merged;
    });
  }, []);

  const memoizedValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    isLoggingOut,
    login,
    logout,
    refreshToken,
    updateUser,
  }), [
    user,
    isLoading,
    isLoggingOut,
    login,
    logout,
    refreshToken,
    updateUser,
  ]);

  return (
    <JWTContext.Provider value={memoizedValue}>
      {children}
    </JWTContext.Provider>
  );
};

export const useJWT = (): JWTContextType => {
  const context = useContext(JWTContext);
  if (context === undefined) {
    throw new Error('useJWT must be used within a JWTProvider');
  }
  return context;
}; 