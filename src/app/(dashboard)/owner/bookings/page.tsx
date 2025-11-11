"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SearchFiltersCard } from '@/components/booking/SearchFiltersCard';
import { ResultsSummary } from '@/components/booking/ResultsSummary';
import { OwnerBookingsDataTable } from '@/components/booking/OwnerBookingsDataTable';
import { StatsCards as BookingStatsCards } from '@/components/booking/StatsCards';
import { useOwnerBookingsPage } from '@/hooks/booking/useOwnerBookingsPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const OwnerBookingsPage = () => {
  const {
    // auth
    isAuthenticated,
    authLoading,
    // local state
    searchQuery,
    statusFilter,
    showFilters,
    actionLoading,
    setShowFilters,
    // data
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    statusOptions,
    statusCounts,
    isStatsLoading,
    // actions
    handleSearch,
    handleStatusFilter,
    handleRefresh,
    handleBookingAction,
    handleAlert,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError,
  } = useOwnerBookingsPage();

  if (authLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Filters card skeleton */}
        <div className="bg-background rounded-md border p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="grow space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="space-y-4">
          <div className="bg-background rounded-md border">
            <div className="overflow-x-auto">
              <div className="min-w-[720px] p-4">
                {/* Table header skeleton */}
                <div className="grid grid-cols-7 gap-4 px-2 py-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24 hidden sm:block" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                {/* Rows skeleton */}
                <div className="space-y-3 mt-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-7 gap-4 items-center px-2 py-3 border-t">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24 hidden sm:block" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <div className="flex justify-start">
                        <Skeleton className="h-8 w-24 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Footer pagination skeleton */}
          <div className="flex items-center justify-between gap-8">
            <div />
            <div className="flex grow justify-end">
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Errors are now handled via Sonner toasts in the hook

  return (
    <div className="space-y-6">
      {/* Success messages are handled via Sonner toasts in the hook */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Bookings</h1>
          <p className="text-gray-600 mt-1">Manage bookings for your vehicles</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {isStatsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={`stats-skeleton-${idx}`}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <BookingStatsCards counts={statusCounts} />
      )}

      <Card>
        <CardContent>
        <div className="space-y-4">
        <SearchFiltersCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        statusOptions={statusOptions}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="bg-background rounded-md border">
            <div className="overflow-x-auto">
              <div className="min-w-[720px] p-4">
                <div className="grid grid-cols-7 gap-4 px-2 py-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24 hidden sm:block" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-3 mt-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-7 gap-4 items-center px-2 py-3 border-t">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24 hidden sm:block" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <div className="flex justify-start">
                        <Skeleton className="h-8 w-24 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-8">
            <div />
            <div className="flex grow justify-end">
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <OwnerBookingsDataTable
          bookings={bookings || []}
          onAction={handleBookingAction}
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={goToPage}
        />
      )}
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerBookingsPage;



