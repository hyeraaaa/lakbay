'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({
  children,
  redirectTo,
}) => {
  const { user, isAuthenticated, isLoading } = useJWT();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !hasRedirected) {
      // User is authenticated, redirect them to appropriate dashboard
      // Add a small delay to avoid race conditions with useAuth hook
      const timer = setTimeout(() => {
        const targetRoute = redirectTo || getDashboardRoute(user.user_type);
        console.log('RedirectIfAuthenticated: Redirecting user', user.user_type, 'to', targetRoute);
        setHasRedirected(true);
        router.replace(targetRoute);
      }, 500); // Increased delay to let useAuth handle the redirect first
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, isLoading, redirectTo, router, hasRedirected]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, don't render children (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  // User is not authenticated, show the auth form
  return <>{children}</>;
};

// Helper function to determine dashboard route based on user type
const getDashboardRoute = (userType: string): string => {
  console.log('getDashboardRoute called with userType:', userType);
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'owner':
      return '/owner';
    case 'customer':
    default:
      return '/'; // Redirect customers to landing page
  }
}; 