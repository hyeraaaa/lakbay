"use client";

import React, { useEffect, useState } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useNotificationSocket } from '../../hooks/notifications/useNotificationSocket';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export const NotificationDebugger: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    refreshNotifications 
  } = useNotificationContext();
  
  const { isConnected, error: socketError } = useNotificationSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdate(new Date());
  }, [notifications, unreadCount]);

  const triggerTestNotification = () => {
    console.log('🔔 Debug: Triggering test notification');
    window.dispatchEvent(new CustomEvent('test-notification', { 
      detail: { 
        notification_id: Date.now(),
        title: 'Debug Test Notification',
        message: 'This is a test notification from the debugger',
        type: 'system',
        is_read: false,
        related_id: null,
        created_at: new Date().toISOString()
      }
    }));
  };

  return (
    <Card className="p-4 m-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Notification Debugger
      </h3>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Socket Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Socket Disconnected</span>
            </>
          )}
        </div>

        {/* Error Display */}
        {(error || socketError) && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error || socketError}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-2">
          <Badge variant="outline">
            Total: {notifications.length}
          </Badge>
          <Badge variant="destructive">
            Unread: {unreadCount}
          </Badge>
          <Badge variant="secondary">
            Loading: {loading ? 'Yes' : 'No'}
          </Badge>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="text-xs text-gray-500">
            Last Update: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={refreshNotifications}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button 
            onClick={triggerTestNotification}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Test Notification
          </Button>
        </div>

        {/* Recent Notifications */}
        <div>
          <h4 className="font-medium mb-2">Recent Notifications:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.notification_id}
                className={`p-2 rounded text-sm border ${
                  notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-gray-600">{notification.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleString()}
                  {!notification.is_read && (
                    <span className="ml-2 text-blue-600 font-medium">• Unread</span>
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

