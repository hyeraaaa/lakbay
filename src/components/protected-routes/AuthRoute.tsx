'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';

interface AuthRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Auth Route Component
 * Redirects authenticated users away from auth pages (login, register, etc.)
 */
export const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  redirectTo = '/'
}) => {
  const { user, isAuthenticated, isLoading } = useJWT();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If user is authenticated, redirect them away from auth pages
    if (isAuthenticated && user) {
      // Redirect based on user type
      switch (user.user_type) {
        case 'admin':
          router.replace('/admin');
          break;
        case 'owner':
          router.replace('/owner');
          break;
        case 'user':
        default:
          router.replace(redirectTo);
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  // Don't render anything while loading or during redirects
  if (isLoading) {
    return null;
  }

  // If user is authenticated, don't render while redirecting
  if (isAuthenticated) {
    return null;
  }

  // Render auth pages for unauthenticated users
  return <>{children}</>;
};

export default AuthRoute;
