'use client';

import React from 'react';
import OwnerRoute from '@/components/protected-routes/OwnerRoute';
import { Sidebar } from '@/components/sidebar-navbar/sidebar';
import { Navbar } from '@/components/sidebar-navbar/navbar';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

/**
 * Owner Layout Component
 * Wraps all owner routes with OwnerRoute protection
 * This ensures all pages under /owner are protected with owner privileges
 */
export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <OwnerRoute>
      <Sidebar />
      <div className="md:pl-16">
        <Navbar />
        <div className="p-4 pt-6">{children}</div>
      </div>
    </OwnerRoute>
  );
}
