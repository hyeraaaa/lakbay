'use client';

import { ReactNode } from 'react';
import { JWTProvider } from '@/contexts/JWTContext';
import { NotificationProvider as NotificationDataProvider } from '@/contexts/NotificationContext';
import { NotificationProvider as AlertProvider } from '@/components/NotificationProvider';
import Navbar from '@/components/navbar/navbar';

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <JWTProvider>
      <NotificationDataProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </NotificationDataProvider>
    </JWTProvider>
  );
}; 