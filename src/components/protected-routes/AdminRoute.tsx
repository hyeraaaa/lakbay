'use client';

import React, { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Admin Route Component
 * Protects routes that require admin privileges
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      allowedUserTypes={['admin']}
      requireEmailVerification={true}
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;
