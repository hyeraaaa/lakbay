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

export const useVehicleBookings = (vehicleId: number, requireAuth: boolean = true): UseVehicleBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!vehicleId || !requireAuth) return;
    
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
  }, [vehicleId, requireAuth]);

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
      const scheduledEndDate = new Date(booking.end_date);
      const checkinTimestamp = booking.checkin_timestamp ? new Date(booking.checkin_timestamp) : null;
      
      // Normalize to start of day
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);
      
      // If the booking was checked-in (completed) early, release the check-in day for others
      // So we block up to the day BEFORE the check-in date
      const normalizedEndDate = new Date(scheduledEndDate);
      normalizedEndDate.setHours(0, 0, 0, 0);

      const normalizedCheckinDay = checkinTimestamp ? new Date(checkinTimestamp) : null;
      if (normalizedCheckinDay) {
        normalizedCheckinDay.setHours(0, 0, 0, 0);
      }
      
      // Add all dates in the booking range
      const currentDate = new Date(normalizedStartDate);
      if (normalizedCheckinDay) {
        // Block until the day before check-in
        while (currentDate < normalizedCheckinDay) {
          bookedDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // No early check-in; block until scheduled end inclusive
        while (currentDate <= normalizedEndDate) {
          bookedDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
    
    return bookedDates;
  }, [bookings]);

  const isDateBooked = useCallback((date: Date): boolean => {
    return bookings.some(booking => {
      const startDate = new Date(booking.start_date);
      const scheduledEndDate = new Date(booking.end_date);
      const checkinTimestamp = booking.checkin_timestamp ? new Date(booking.checkin_timestamp) : null;
      
      // Normalize dates to start of day for comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);
      
      const normalizedEndDate = new Date(scheduledEndDate);
      normalizedEndDate.setHours(0, 0, 0, 0);
      
      // If checked-in early, release check-in date (exclusive end)
      if (checkinTimestamp) {
        const normalizedCheckinDay = new Date(checkinTimestamp);
        normalizedCheckinDay.setHours(0, 0, 0, 0);
        return checkDate >= normalizedStartDate && checkDate < normalizedCheckinDay;
      }
      
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
