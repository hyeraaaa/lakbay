'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  allowedUserTypes?: string[];
  requireEmailVerification?: boolean;
  requireAccountVerification?: boolean;
}

/**
 * Protected Route Component
 * Wraps children and protects them based on authentication and authorization rules
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requireAuth = true,
  allowedUserTypes = [],
  requireEmailVerification = false,
  requireAccountVerification = false,
}) => {
  const { user, isAuthenticated, isLoading } = useJWT();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // If user is authenticated but doesn't have required user type
    if (isAuthenticated && allowedUserTypes.length > 0 && user) {
      if (!allowedUserTypes.includes(user.user_type)) {
        router.replace('/unauthorized');
        return;
      }
    }

    // If email verification is required but user's email is not verified
    if (isAuthenticated && requireEmailVerification && user) {
      if (!user.is_email_verified) {
        router.replace('/verify-email');
        return;
      }
    }

    // If account verification is required but user's account is not verified
    if (isAuthenticated && requireAccountVerification && user) {
      if (!user.is_verified) {
        router.replace('/account-verification');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, allowedUserTypes, redirectTo, requireAccountVerification, requireAuth, requireEmailVerification]);

  // Don't render anything while loading or during redirects
  if (isLoading) {
    return null;
  }

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If user type restrictions exist and user doesn't meet them, don't render
  if (isAuthenticated && allowedUserTypes.length > 0 && user) {
    if (!allowedUserTypes.includes(user.user_type)) {
      return null;
    }
  }

  // If email verification is required but not met, don't render
  if (isAuthenticated && requireEmailVerification && user) {
    if (!user.is_email_verified) {
      return null;
    }
  }

  // If account verification is required but not met, don't render
  if (isAuthenticated && requireAccountVerification && user) {
    if (!user.is_verified) {
      return null;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
