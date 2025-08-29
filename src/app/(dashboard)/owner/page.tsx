'use client';

import { OwnerRoute } from '@/components/auth/ProtectedRoute';
import { AuthNav } from '@/components/auth/AuthNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OwnerDashboardPage() {
  return (
    <OwnerRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
              <AuthNav />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Owner Panel</CardTitle>
                  <CardDescription>Property management controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This page is only accessible to property owners.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                  <CardDescription>Manage your properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      View Properties
                    </button>
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Add New Property
                    </button>
                    <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Property Settings
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Owner Overview</CardTitle>
                  <CardDescription>Your property statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Total Properties:</strong> 5</p>
                    <p><strong>Active Listings:</strong> 3</p>
                    <p><strong>Total Revenue:</strong> $12,450</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </OwnerRoute>
  );
}
