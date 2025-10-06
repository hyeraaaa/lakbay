import { useState, useEffect, useCallback } from 'react';
import { bookingService, Booking, BookingStatus } from '@/services/bookingServices';

interface UseVehicleBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string;
  refreshBookings: () => Promise<void>;
  getBookedDates: () => Date[];
  isDateBooked: (date: Date) => boolean;
}

export const useVehicleBookings = (vehicleId: number): UseVehicleBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!vehicleId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch bookings for this specific vehicle
      const response = await bookingService.listBookings({
        vehicle_id: vehicleId,
        limit: 100 // Get all bookings for this vehicle
      });
      
      // Filter out cancelled bookings as they don't block dates
      const activeBookings = response.bookings.filter(booking => 
        booking.status !== BookingStatus.CANCELED
      );
      
      setBookings(activeBookings);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle bookings';
      setError(errorMessage);
      console.error('Error fetching vehicle bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const getBookedDates = useCallback((): Date[] => {
    const bookedDates: Date[] = [];
    
    bookings.forEach(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      // Normalize to start of day
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);
      
      const normalizedEndDate = new Date(endDate);
      normalizedEndDate.setHours(0, 0, 0, 0);
      
      // Add all dates in the booking range
      const currentDate = new Date(normalizedStartDate);
      while (currentDate <= normalizedEndDate) {
        bookedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return bookedDates;
  }, [bookings]);

  const isDateBooked = useCallback((date: Date): boolean => {
    return bookings.some(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      // Normalize dates to start of day for comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);
      
      const normalizedEndDate = new Date(endDate);
      normalizedEndDate.setHours(0, 0, 0, 0);
      
      // Check if the date falls within any booking range
      return checkDate >= normalizedStartDate && checkDate <= normalizedEndDate;
    });
  }, [bookings]);

  return {
    bookings,
    isLoading,
    error,
    refreshBookings,
    getBookedDates,
    isDateBooked
  };
};
