'use client';

import React, { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface UserRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
  requireAccountVerification?: boolean;
}

/**
 * User Route Component
 * Protects routes that require user authentication
 */
export const UserRoute: React.FC<UserRouteProps> = ({ 
  children, 
  requireEmailVerification = false,
  requireAccountVerification = false
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      allowedUserTypes={['customer']} // Only customers can access user routes
      requireEmailVerification={requireEmailVerification}
      requireAccountVerification={requireAccountVerification}
    >
      {children}
    </ProtectedRoute>
  );
};

export default UserRoute;
