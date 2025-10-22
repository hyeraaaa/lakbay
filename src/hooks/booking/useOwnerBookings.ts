import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingService, Booking, BookingFilters, BookingListResponse } from '@/services/bookingServices';

interface UseOwnerBookingsReturn {
  bookings: Booking[] | null;
  isLoading: boolean;
  error: string;
  filters: BookingFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  updateFilters: (newFilters: Partial<BookingFilters>) => void;
  refreshBookings: () => Promise<void>;
  goToPage: (page: number) => void;
  clearFilters: () => void;
  setError: (error: string) => void;
  allBookings: Booking[];
  updateBookingLocal: (bookingId: number, updater: (b: Booking) => Booking) => void;
}

export const useOwnerBookings = (): UseOwnerBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Backend now handles filtering and pagination
      const response: BookingListResponse = await bookingService.listBookings(filters);
      setBookings(response.bookings || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (response.limit || 10))
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching owner bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchAllBookings = useCallback(async () => {
    try {
      // Fetch all bookings without any filters for stats
      const response: BookingListResponse = await bookingService.listBookings({
        page: 1,
        limit: 1000 // Large limit to get all bookings
      });
      setAllBookings(response.bookings || []);
    } catch (err: unknown) {
      console.error('Error fetching all bookings for stats:', err);
      setAllBookings([]);
    }
  }, []);

  // Fetch all bookings for stats on mount
  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  // Avoid duplicate fetches in React Strict Mode by tracking the last filters used
  const lastFetchKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = JSON.stringify(filters);
    if (lastFetchKeyRef.current === key) {
      return;
    }
    lastFetchKeyRef.current = key;
    fetchBookings();
  }, [filters, fetchBookings]);

  const updateFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    setFilters(prev => {
      const merged: BookingFilters = { ...prev, ...newFilters } as BookingFilters;
      // Shallow equality check to prevent no-op updates that cause refetch flicker
      const keys = new Set([...Object.keys(prev), ...Object.keys(merged)]);
      let changed = false;
      for (const k of keys) {
        // @ts-expect-error: index access
        if (prev[k] !== merged[k]) {
          changed = true;
          break;
        }
      }
      return changed ? merged : prev;
    });
  }, []);

  const refreshBookings = useCallback(async () => {
    await Promise.all([fetchBookings(), fetchAllBookings()]);
  }, [fetchBookings, fetchAllBookings]);

  const goToPage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10
    });
  }, []);

  const updateBookingLocal = useCallback((bookingId: number, updater: (b: Booking) => Booking) => {
    setBookings(prev => {
      if (!prev) return prev;
      return prev.map(b => (b.booking_id === bookingId ? updater(b) : b));
    });
    setAllBookings(prev => prev.map(b => (b.booking_id === bookingId ? updater(b) : b)));
  }, []);

  return {
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError,
    allBookings,
    updateBookingLocal,
  };
};
