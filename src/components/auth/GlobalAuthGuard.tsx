'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useJWT } from '@/contexts/JWTContext';

export const GlobalAuthGuard = () => {
  const { isAuthenticated, isLoading } = useJWT();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Check if current path is protected
      const isProtectedRoute = pathname.startsWith('/dashboard') || 
                              pathname.startsWith('/profile') || 
                              pathname.startsWith('/settings') ||
                              pathname.startsWith('/admin');

      if (isProtectedRoute && !isAuthenticated) {
        // User is on a protected route but not authenticated
        // Clear any cached data and redirect to login
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't render anything, this is just a guard
  return null;
}; 