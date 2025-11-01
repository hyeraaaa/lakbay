'use client';

import React, { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface OwnerRouteProps {
  children: ReactNode;
}

/**
 * Owner Route Component
 * Protects routes that require owner privileges
 */
export const OwnerRoute: React.FC<OwnerRouteProps> = ({ 
  children
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      allowedUserTypes={['owner', 'admin']}
      requireEmailVerification={true}
    >
      {children}
    </ProtectedRoute>
  );
};

export default OwnerRoute;
