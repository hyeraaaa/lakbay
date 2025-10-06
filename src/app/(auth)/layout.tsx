'use client';

import React from 'react';
import AuthRoute from '@/components/protected-routes/AuthRoute';
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth Layout Component
 * Wraps all auth routes with AuthRoute protection
 * This ensures authenticated users are redirected away from auth pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  // Allow verify-email pages to bypass AuthRoute protection
  if (pathname?.startsWith('/verify-email')) {
    return <>{children}</>;
  }

  return (
    <AuthRoute>
      {children}
    </AuthRoute>
  );
}
