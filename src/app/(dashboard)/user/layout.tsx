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

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const showBanner = pathname === '/user';
  const protectedRoutes = ['/user/bookings', '/user/become-a-host'];
  const isProtected = protectedRoutes.includes(pathname);

  const content = (
    <>
      {showBanner && <VerificationBanner />}
      <Navbar />
      {children}
      <GeneralChatWidget />
    </>
  );

  return isProtected ? <UserRoute>{content}</UserRoute> : content;
}
