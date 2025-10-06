import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationResponse, NotificationStats } from '../../services/notificationService';
import { useNotificationSocket, NotificationSocketData, NotificationCountUpdate } from './useNotificationSocket';
import { useJWT } from '@/contexts/JWTContext';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  page?: number;
  limit?: number;
  type?: string;
  is_read?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchNotifications: (params?: UseNotificationsOptions) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    autoFetch = true,
    page = 1,
    limit = 20,
    type,
    is_read
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  // Socket.IO connection for real-time notifications
  const { socket, isConnected, error: socketError } = useNotificationSocket();
  const { isAuthenticated: isAuthed } = useJWT();

  // Helper function to deduplicate notifications by notification_id
  const deduplicateNotifications = useCallback((notifications: Notification[]): Notification[] => {
    const seen = new Set<number>();
    return notifications.filter(notification => {
      if (seen.has(notification.notification_id)) {
        return false;
      }
      seen.add(notification.notification_id);
      return true;
    });
  }, []);
  
  // Helper function for test notifications
  const handleNewNotification = useCallback((data: NotificationSocketData) => {
    console.log('🔔 useNotifications: Processing notification:', data);
    
     setNotifications(prev => {
       const newNotification: Notification = {
         notification_id: data.notification_id,
         title: data.title,
         message: data.message,
         type: data.type as "booking" | "payment" | "review" | "system",
         is_read: data.is_read,
         related_id: data.related_id || undefined,
         created_at: data.created_at,
         read_at: data.is_read ? new Date().toISOString() : undefined
       };
      
      const exists = prev.some(n => n.notification_id === data.notification_id);
      if (exists) {
        console.log('🔔 Notification already exists, skipping duplicate');
        return prev;
      }
      
      console.log('🔔 Adding new notification to list');
      return deduplicateNotifications([newNotification, ...prev]);
    });
  }, [deduplicateNotifications]);

  // Debug socket connection
  useEffect(() => {
    console.log('🔔 useNotifications: Socket status:', { socket: !!socket, isConnected, socketError });
  }, [socket, isConnected, socketError]);

  // Test event listener for debugging
  useEffect(() => {
    const handleTestNotification = (event: CustomEvent) => {
      console.log('🔔 Test notification received:', event.detail);
      const data = event.detail as NotificationSocketData;
      handleNewNotification(data);
    };

    window.addEventListener('test-notification', handleTestNotification as EventListener);
    return () => {
      window.removeEventListener('test-notification', handleTestNotification as EventListener);
    };
  }, [handleNewNotification]);

  const fetchNotifications = useCallback(async (params?: UseNotificationsOptions) => {
    try {
      if (!isAuthed) {
        // Not authenticated; skip fetching silently
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      
      const fetchParams = {
        page: params?.page || page,
        limit: params?.limit || limit,
        type: params?.type || type,
        is_read: params?.is_read !== undefined ? params.is_read : is_read
      };

      const response: NotificationResponse = await notificationService.getNotifications(fetchParams);
      
      // Always replace notifications for initial fetch, ensuring no duplicates
      setNotifications(deduplicateNotifications(response.notifications));
      setUnreadCount(response.unread_count);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, is_read, isAuthed, deduplicateNotifications]);

  const loadMoreNotifications = useCallback(async () => {
    if (!isAuthed || !pagination || pagination.page >= pagination.pages || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);
      
      const nextPage = pagination.page + 1;
      const response: NotificationResponse = await notificationService.getNotifications({
        page: nextPage,
        limit: pagination.limit,
        type,
        is_read
      });
      
      // Append new notifications to existing ones, filtering out duplicates
      setNotifications(prev => {
        const combined = [...prev, ...response.notifications];
        return deduplicateNotifications(combined);
      });
      setUnreadCount(response.unread_count);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more notifications';
      setError(errorMessage);
      console.error('Error loading more notifications:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [pagination, type, is_read, loadingMore, isAuthed, deduplicateNotifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const refreshStats = useCallback(async () => {
    try {
      if (!isAuthed) return;
      const statsData = await notificationService.getNotificationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [isAuthed]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update stats if available
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      console.error('Error marking notification as read:', err);
    }
  }, [stats]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: 0 } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(errorMessage);
      console.error('Error marking all notifications as read:', err);
    }
  }, [stats]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.notification_id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.notification_id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Update stats
      if (stats) {
        const wasUnread = deletedNotification && !deletedNotification.is_read;
        setStats(prev => prev ? { 
          ...prev, 
          total: prev.total - 1,
          unread: wasUnread ? Math.max(0, prev.unread - 1) : prev.unread
        } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      console.error('Error deleting notification:', err);
    }
  }, [notifications, stats]);

  // Socket.IO event listeners for real-time updates
  useEffect(() => {
    if (!socket) {
      console.log('🔔 useNotifications: No socket available');
      return;
    }

    console.log('🔔 useNotifications: Setting up socket event listeners');

    const handleNewNotificationSocket = (data: NotificationSocketData) => {
      console.log('🔔 useNotifications: Received new notification via socket:', data);
      handleNewNotification(data);
    };

    const handleCountUpdate = (data: NotificationCountUpdate) => {
      console.log('🔔 useNotifications: Received count update via socket:', data);
      setUnreadCount(data.unread_count);
    };

    const handleMarkAsRead = (data: { notification_id: number }) => {
      console.log('Notification marked as read via socket:', data);
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === data.notification_id
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleDelete = (data: { notification_id: number }) => {
      console.log('Notification deleted via socket:', data);
      setNotifications(prev => 
        prev.filter(notification => notification.notification_id !== data.notification_id)
      );
    };

    // Listen for socket events
    socket.on('new_notification', handleNewNotificationSocket);
    socket.on('notification_count_update', handleCountUpdate);
    socket.on('notification_marked_read', handleMarkAsRead);
    socket.on('notification_deleted', handleDelete);

    return () => {
      socket.off('new_notification', handleNewNotificationSocket);
      socket.off('notification_count_update', handleCountUpdate);
      socket.off('notification_marked_read', handleMarkAsRead);
      socket.off('notification_deleted', handleDelete);
    };
  }, [socket, handleNewNotification]);

  // Auto-fetch on mount and when dependencies change (only initial load)
  useEffect(() => {
    if (autoFetch && isAuthed) {
      fetchNotifications();
      refreshStats();
    }
  }, [autoFetch, isAuthed, fetchNotifications, refreshStats]);

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    loadingMore,
    error: error || socketError,
    pagination,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    refreshStats
  };
};
