"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/services/bookingServices';
import { bookingService } from '@/services/bookingServices';
import { useJWT } from '@/contexts/JWTContext';

interface UseBookingDetailsProps {
  bookingId: string;
}

interface UseBookingDetailsReturn {
  booking: Booking | null;
  loading: boolean;
  error: string;
  handleAction: (action: string) => Promise<void>;
}

export function useBookingDetails({ bookingId }: UseBookingDetailsProps): UseBookingDetailsReturn {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useJWT();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId || !isAuthenticated) return;
      
      try {
        setLoading(true);
        setError('');
        // bookingId is already decoded from the URL, so we can use it directly
        const bookingData = await bookingService.getBookingDetails(parseInt(bookingId));
        setBooking(bookingData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking details';
        setError(errorMessage);
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, isAuthenticated]);

  const handleAction = async (action: string) => {
    if (!booking) return;
    
    try {
      switch (action) {
        case 'cancelled':
          {
            // Cancellation already performed in UI component; just refresh
            const updated = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(updated);
          }
          break;
        case 'pay':
          const paymentResponse = await bookingService.initiatePayment(booking.booking_id);
          if (paymentResponse.checkout_url) {
            window.location.href = paymentResponse.checkout_url;
          }
          break;
        case 'pay-overage':
          const overagePaymentResponse = await bookingService.getOveragePayment(booking.booking_id);
          if (overagePaymentResponse.checkout_url) {
            window.location.href = overagePaymentResponse.checkout_url;
          }
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this booking?')) {
            await bookingService.cancelBooking(booking.booking_id);
            // Refresh booking data
            const updatedBooking = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(updatedBooking);
          }
          break;
        case 'check-in':
          await bookingService.checkIn(booking.booking_id);
          // Refresh booking data
          const updatedBooking = await bookingService.getBookingDetails(booking.booking_id);
          setBooking(updatedBooking);
          break;
        case 'end-early':
          if (confirm('Are you sure you want to end this booking early?')) {
            await bookingService.endEarly(booking.booking_id);
            // Refresh booking data
            const updatedBooking = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(updatedBooking);
          }
          break;
        case 'reviewed':
          {
            // Review completed in UI component; refresh to update eligibility and status
            const refreshed = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(refreshed);
          }
          break;
        case 'refund_requested':
          {
            // Refund request submitted in UI component; refresh to update eligibility and status
            const refreshed = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(refreshed);
          }
          break;
        // Owner actions - these are handled in OwnerBookingActionsCard but we need to refresh data
        case 'approve':
        case 'reject':
        case 'checkout':
        case 'checkin':
          // Refresh booking data after owner action
          const refreshedBooking = await bookingService.getBookingDetails(booking.booking_id);
          setBooking(refreshedBooking);
          break;
        default:
          // For any other action, attempt a passive refresh
          try {
            const fallback = await bookingService.getBookingDetails(booking.booking_id);
            setBooking(fallback);
          } catch {}
          break;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      setError(errorMessage);
    }
  };

  return {
    booking,
    loading,
    error,
    handleAction
  };
}

