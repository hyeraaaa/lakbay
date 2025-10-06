"use client"

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function TestNotificationTriggerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const triggerTestNotification = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          title: 'Test Notification',
          message: 'This is a test notification triggered manually',
          type: 'system'
        })
      });

      if (response.ok) {
        setResult('✅ Test notification sent successfully! Check your notifications.');
      } else {
        const error = await response.text();
        setResult(`❌ Error: ${error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Test Notification Trigger</h1>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <p className="text-sm text-gray-600 mb-4">
                This will trigger a test notification to see if Socket.IO is working properly.
                Check the browser console for Socket.IO logs and your notification popover for the new notification.
              </p>
            </div>

            <Button 
              onClick={triggerTestNotification}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test Notification'}
            </Button>

            {result && (
              <div className={`p-4 rounded ${
                result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {result}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">Debugging Steps:</h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                <li>Open browser console (F12)</li>
                <li>Click &quot;Send Test Notification&quot; button</li>
                <li>Look for Socket.IO connection logs (🔔 emoji)</li>
                <li>Check if notification appears in the notification popover</li>
                <li>If no notification appears, check backend logs for Socket.IO events</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
