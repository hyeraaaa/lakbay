import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Bell, CheckCheck, Loader2, AlertCircle, X } from 'lucide-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';

interface NotificationPopoverProps {
  children?: React.ReactNode;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    error,
    pagination,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications
  } = useNotificationContext();


  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleLoadMore = () => {
    loadMoreNotifications();
  };

  const handleBellClick = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
    setIsOpen(!isOpen);
  };


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleBellClick}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Button>
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs px-3 py-1"
                >
                  <CheckCheck className="h-3 w-3 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close notifications"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-sm text-red-500">{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Bell className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">No notifications found</span>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.notification_id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
                
                {/* Show skeleton loaders when loading more */}
                {loadingMore && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <NotificationSkeleton key={`skeleton-${index}`} />
                    ))}
                  </div>
                )}
                
                {pagination && pagination.page < pagination.pages && !loadingMore && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      className="w-full"
                      disabled={loadingMore}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
