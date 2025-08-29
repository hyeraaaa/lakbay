'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/lib/jwt';

interface JWTContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUserState(currentUser);
          } else {
            // User data is missing, clear everything and redirect
            clearTokens();
            clearUser();
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
        clearUser();
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

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
  }, [user]);

  const login = (tokens: AuthTokens, userData: User) => {
    setTokens(tokens);
    setUser(userData);
    setUserState(userData);
  };

  const logout = async () => {
    try {
      await logoutUtil();
      setUserState(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server call fails
      clearTokens();
      clearUser();
      setUserState(null);
      router.push('/login');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUserState(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates } as User;
      setUser(merged);
      return merged;
    });
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Update user state if needed
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUserState(currentUser);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  const value: JWTContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <JWTContext.Provider value={value}>
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