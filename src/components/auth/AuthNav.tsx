'use client';

import { useJWT } from '@/contexts/JWTContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export const AuthNav = () => {
  const { user, isAuthenticated, logout, isLoading } = useJWT();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {user?.email}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          ({user?.user_type})
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  );
}; 