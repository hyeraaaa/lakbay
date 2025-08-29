'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useJWT();
  const router = useRouter();

  useEffect(() => {
    // Only proceed if we're done loading and have determined auth state
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
        return;
      }

      // Check user type if required
      if (requiredUserType && user?.user_type !== requiredUserType) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredUserType, redirectTo, router]);

  // While checking authentication, render nothing to avoid spinners or flashes
  if (isLoading) {
    return null;
  }

  // Don't render anything if not authenticated or user type doesn't match
  // This prevents the flash of unauthorized content
  if (!isAuthenticated || (requiredUserType && user?.user_type !== requiredUserType)) {
    return null;
  }

  return <>{children}</>;
};

// Convenience components for different user types
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserType="admin" redirectTo="/login">
    {children}
  </ProtectedRoute>
);

export const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserType="owner" redirectTo="/login">
    {children}
  </ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserType="customer" redirectTo="/login">
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute redirectTo="/login">
    {children}
  </ProtectedRoute>
); 