'use client';

import React from 'react';
import AdminRoute from '@/components/protected-routes/AdminRoute';
import { Sidebar } from '@/components/sidebar-navbar/sidebar';
import { Navbar } from '@/components/sidebar-navbar/navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout Component
 * Wraps all admin routes with AdminRoute protection
 * This ensures all pages under /admin are protected with admin privileges
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRoute>
      <Sidebar />
      <div className="md:pl-16">
        <Navbar />
        <div className="p-4 pt-6">{children}</div>
      </div>
    </AdminRoute>
  );
}
