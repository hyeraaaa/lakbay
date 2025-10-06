"use client"

import React from 'react';
import { useNotificationSocket } from '../../hooks/notifications/useNotificationSocket';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const NotificationSocketTest: React.FC = () => {
  const { isConnected, error: socketError } = useNotificationSocket();
  const { notifications, unreadCount, refreshNotifications } = useNotificationContext();

  return (
    <Card className="p-4 m-4">
      <h3 className="text-lg font-semibold mb-4">Socket.IO Notification Test</h3>
      
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
        {socketError && (
          <div className="text-red-600 text-sm">
            Error: {socketError}
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
        </div>

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
            onClick={() => {
              console.log('🔔 Test: Manually triggering notification test');
              // This will help us see if the socket is working
              window.dispatchEvent(new CustomEvent('test-notification', { 
                detail: { 
                  notification_id: Date.now(),
                  title: 'Test Notification',
                  message: 'This is a test notification',
                  type: 'system',
                  is_read: false,
                  related_id: null,
                  created_at: new Date().toISOString()
                }
              }));
            }}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            Test Socket
          </Button>
        </div>

        {/* Recent Notifications */}
        <div>
          <h4 className="font-medium mb-2">Recent Notifications:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.slice(0, 3).map((notification) => (
              <div 
                key={notification.notification_id}
                className={`p-2 rounded text-sm ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-gray-600">{notification.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
