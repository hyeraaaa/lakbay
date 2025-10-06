"use client"

import React from 'react';
import { NotificationSocketTest } from '../../components/notifications/NotificationSocketTest';
import { NotificationDebugger } from '../../components/notifications/NotificationDebugger';
import { NotificationPopover } from '../../components/notifications/NotificationPopover';

export default function TestNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notification Socket.IO Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Socket Test Component */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Socket Connection Test</h2>
            <NotificationSocketTest />
          </div>
          
          {/* Notification Debugger */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Real-time Debugger</h2>
            <NotificationDebugger />
          </div>
          
          {/* Notification Popover Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Notification Popover Test</h2>
            <div className="flex justify-center">
              <NotificationPopover>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Test Notifications
                </button>
              </NotificationPopover>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Check if &quot;Socket Connected&quot; shows green in the test component</li>
            <li>Open browser console to see Socket.IO connection logs</li>
            <li>Create a new notification from another user/account</li>
            <li>Watch for real-time updates without page refresh</li>
            <li>If you see &quot;Socket Disconnected&quot;, check your authentication</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
