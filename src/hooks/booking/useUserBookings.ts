import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingService, Booking, BookingFilters, BookingListResponse } from '@/services/bookingServices';

export interface UseUserBookingsOptions {
  initialFilters?: BookingFilters;
  autoFetch?: boolean;
}

export const useUserBookings = (options: UseUserBookingsOptions = {}) => {
  const { initialFilters = {}, autoFetch = true } = options;
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Use ref to avoid circular dependencies
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchBookings = useCallback(async (newFilters?: Partial<BookingFilters>) => {
    setIsLoading(true);
    setError('');

    try {
      // Use ref to get latest filters without causing dependency issues
      const currentFilters = { ...filtersRef.current, ...newFilters };
      console.log('Fetching bookings with filters:', currentFilters);
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      const response = await bookingService.listBookings(currentFilters);
      console.log('Received response:', response);

      setBookings(response.bookings || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (response.limit || 10))
      });
      
      if (newFilters) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchBookings(newFilters);
  }, []);

  const refreshBookings = useCallback(() => {
    fetchBookings();
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBookings({ page });
    }
  }, [pagination.totalPages]);

  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: 10 };
    setFilters(clearedFilters);
    fetchBookings(clearedFilters);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      console.log('Auto-fetching bookings on mount');
      fetchBookings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    fetchBookings,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError
  };
};
