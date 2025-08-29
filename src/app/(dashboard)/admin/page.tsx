'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AuthNav } from '@/components/auth/AuthNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <AuthNav />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>Administrative controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This page is only accessible to admin users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      View All Users
                    </button>
                    <Link href="/admin/verification-requests" className="block w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Verification Requests
                    </Link>
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Manage Permissions
                    </button>
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      System Settings
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>System statistics and health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Total Users:</strong> 1,234</p>
                    <p><strong>Active Sessions:</strong> 89</p>
                    <p><strong>System Status:</strong> Healthy</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
