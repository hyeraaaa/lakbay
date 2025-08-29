'use client';

import { ReactNode } from 'react';
import { JWTProvider, useJWT } from '@/contexts/JWTContext';
import Navbar from '@/app/Landing/landing-page-section/navbar';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const hideNavbar = (() => {
    if (!pathname) return false;
    // Hide on auth routes
    return pathname.startsWith('/login')
      || pathname.startsWith('/register')
      || pathname.startsWith('/forgot-password')
      || pathname.startsWith('/reset-password')
      || pathname.startsWith('/verify-email')
      || pathname.startsWith('/email-verification')
      || pathname.startsWith('/(auth)');
  })();

  return (
    <JWTProvider>
      {!hideNavbar && <NavbarVisibility />}
      {children}
    </JWTProvider>
  );
}; 

const NavbarVisibility: React.FC = () => {
  const { isAuthenticated, isLoading } = useJWT();
  const pathname = usePathname();

  // If pathname is not available yet, avoid rendering navbar
  if (!pathname) return null;

  const isAuthRoute = pathname.startsWith('/login')
    || pathname.startsWith('/register')
    || pathname.startsWith('/forgot-password')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/verify-email')
    || pathname.startsWith('/email-verification')
    || pathname.startsWith('/(auth)');

  const isProtectedRoute = pathname.startsWith('/dashboard')
    || pathname.startsWith('/profile')
    || pathname.startsWith('/settings')
    || pathname.startsWith('/admin');

  // Always hide on auth routes
  if (isAuthRoute) return null;

  // On protected routes, hide while loading or if unauthenticated to prevent flashes
  if (isProtectedRoute) {
    if (isLoading || !isAuthenticated) return null;
  }

  return <Navbar />;
};