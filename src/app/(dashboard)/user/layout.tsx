'use client';

import React from 'react';
import UserRoute from '@/components/protected-routes/UserRoute';
import Navbar from '@/components/navbar/navbar';
import { VerificationBanner } from '@/components/auth/VerificationBanner';
import { generalChatWidget as GeneralChatWidget } from '@/components/chat/generalChatwidget';
import { usePathname } from 'next/navigation';

interface UserLayoutProps {
  children: React.ReactNode;
}

/**
 * User Layout Component
 * Wraps all user routes with UserRoute protection
 * This ensures all pages under /user are protected with user authentication
 */
export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const showBanner = pathname === '/user';
  return (
    <UserRoute>
      {showBanner && <VerificationBanner />}
      <Navbar />
      {children}
      <GeneralChatWidget />
    </UserRoute>
  );
}
