"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useBookingsPage } from '@/hooks/booking/useBookingsPage';
import { StatsCards } from '@/components/booking/StatsCards';
import { SearchFiltersCard } from '@/components/booking/SearchFiltersCard';
import { BookingsList } from '@/components/booking/BookingsList';
import { PaginationControls } from '@/components/booking/PaginationControls';
import { ResultsSummary } from '@/components/booking/ResultsSummary';
import { Skeleton } from '@/components/ui/skeleton';

const BookingsPage = () => {
  const {
    // auth
    isAuthenticated,
    authLoading,
    // state
    searchQuery,
    statusFilter,
    showFilters,
    // data
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    statusCounts: counts,
    statusOptions,
    // actions
    setShowFilters,
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
  } = useBookingsPage();

  // Show skeleton while auth is loading
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-36 w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const statusCounts = counts;

  if (error) {
  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => setError('')}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your vehicle rental bookings</p>
            </>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-36 w-full" />
      ) : (
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
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <BookingsList
          isLoading={isLoading}
          bookings={bookings}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onClearFilters={clearFilters}
          onAction={handleBookingAction}
          onAlert={handleAlert}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <PaginationControls page={pagination.page} totalPages={pagination.totalPages} goToPage={goToPage} />
      )}

      {isLoading ? (
        <Skeleton className="h-4 w-40" />
      ) : (
        <ResultsSummary
          count={bookings?.length || 0}
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
};

export default BookingsPage;