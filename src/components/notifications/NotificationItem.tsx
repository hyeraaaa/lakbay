import React from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '../../services/notificationService';
// Removed Card to use plain div wrapper
import { Button } from '../ui/button';
import { Check, Clock, AlertCircle, CreditCard, Star, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useJWT } from '../../contexts/JWTContext';
import { encodeId } from '../../lib/idCodec';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'payment':
      return <CreditCard className="h-4 w-4 text-green-500" />;
    case 'review':
      return <Star className="h-4 w-4 text-yellow-500" />;
    case 'system':
      return <Settings className="h-4 w-4 text-purple-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationPath = (notification: Notification, userType: string): string | null => {
  console.log('🔔 Getting path for notification:', { 
    type: notification.type, 
    related_id: notification.related_id, 
    userType 
  });
  
  if (!notification.related_id) {
    console.log('🔔 No related_id, returning null');
    return null;
  }
  
  switch (notification.type) {
    case 'booking':
      // Route based on user type for proper RBAC
      if (userType === 'customer') {
        return `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
      } else if (userType === 'owner') {
        return `/owner/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
      } else if (userType === 'admin') {
        // Redirect to admin dashboard since admin booking details page doesn't exist yet
        return `/admin`;
      }
      // Fallback for unknown user types
      return `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
    case 'payment':
      // Route based on user type for proper RBAC
      if (userType === 'customer') {
        const paymentPath = `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
        console.log('🔔 Payment notification path for customer:', paymentPath);
        return paymentPath;
      } else if (userType === 'owner') {
        const paymentPath = `/owner/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
        console.log('🔔 Payment notification path for owner:', paymentPath);
        return paymentPath;
      } else if (userType === 'admin') {
        // Redirect to admin dashboard since admin booking details page doesn't exist yet
        const paymentPath = `/admin`;
        console.log('🔔 Payment notification path for admin:', paymentPath);
        return paymentPath;
      }
      // Fallback for unknown user types
      const paymentPath = `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
      console.log('🔔 Payment notification path (fallback):', paymentPath);
      return paymentPath;
    case 'review':
      // Route based on user type for proper RBAC
      if (userType === 'customer') {
        const reviewPath = `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
        console.log('🔔 Review notification path for customer:', reviewPath);
        return reviewPath;
      } else if (userType === 'owner') {
        const reviewPath = `/owner/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
        console.log('🔔 Review notification path for owner:', reviewPath);
        return reviewPath;
      } else if (userType === 'admin') {
        // Redirect to admin dashboard since admin booking details page doesn't exist yet
        const reviewPath = `/admin`;
        console.log('🔔 Review notification path for admin:', reviewPath);
        return reviewPath;
      }
      // Fallback for unknown user types
      const reviewPath = `/user/bookings/booking-details/${encodeId(notification.related_id.toString())}`;
      console.log('🔔 Review notification path (fallback):', reviewPath);
      return reviewPath;
    case 'system':
      const message = notification.message.toLowerCase();
      const title = notification.title.toLowerCase();
      
      // For admins - redirect to verification requests
      if (userType === 'admin') {
        // Account verification (identity verification)
        if ((title.includes('verification') || message.includes('verification')) && 
            (message.includes('submitted') || message.includes('approved') || message.includes('rejected'))) {
          return `/admin/verification-requests/request-body/ver_${notification.related_id}`;
        }
        
        // Vehicle registration verification
        if ((title.includes('vehicle registration') || message.includes('vehicle registration')) && 
            (message.includes('submitted') || message.includes('approved') || message.includes('rejected') || message.includes('unregistered'))) {
          return `/admin/verification-requests/request-body/reg_${notification.related_id}`;
        }
        
        // Business permit verification (owner enrollment)
        if ((title.includes('business permit') || title.includes('owner enrollment') || 
             message.includes('business permit') || message.includes('owner enrollment')) && 
            (message.includes('submitted') || message.includes('approved') || message.includes('rejected'))) {
          return `/admin/verification-requests/request-body/owner_${notification.related_id}`;
        }
        
        // For other system notifications, redirect to admin dashboard
        return '/admin';
      }
      
      // For owners and customers - system notifications should not be clickable
      if (userType === 'owner' || userType === 'customer') {
        return null;
      }
      
      // Fallback for unknown user types: not clickable
      return null;
    default:
      return null;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead
}) => {
  const router = useRouter();
  const { user } = useJWT();
  const userType = user?.user_type || 'customer';
  const navigationPath = getNotificationPath(notification, userType);

  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.notification_id);
    }
  };


  const handleCardClick = () => {
    // Only navigate if there's a valid path
    if (navigationPath) {
      console.log('🔔 Navigating to:', navigationPath, 'for notification:', notification);
      // Mark as read first
      handleMarkAsRead();
      router.push(navigationPath);
    } else {
      console.log('🔔 No navigation path for notification:', notification);
    }
  };

  const isClickable = !!navigationPath;

  return (
    <div 
      className={`p-4 transition-colors duration-200 hover:bg-gray-100 ${
        notification.is_read 
          ? 'bg-white' 
          : 'bg-gray-50'
      } ${
        isClickable 
          ? 'cursor-pointer' 
          : 'cursor-default'
      }`}
      onClick={isClickable ? handleCardClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
              {isClickable && (
                <span className="ml-2 text-xs text-blue-500">→</span>
              )}
            </h4>
            <div className="flex items-center gap-3">
              {!notification.is_read && (
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
