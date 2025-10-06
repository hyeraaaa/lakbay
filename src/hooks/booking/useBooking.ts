import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService, CreateBookingData, CreateBookingResponse, PaymentInitiationResponse } from '@/services/bookingServices';

export interface BookingFormData {
  vehicle_id: number;
  start_date: string;
  end_date: string;
  pick_up_location: string;
  drop_off_location: string;
}

export const useBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const createBooking = useCallback(async (formData: BookingFormData): Promise<CreateBookingResponse | null> => {
    setIsLoading(true);
    setError('');

    try {
      const bookingData: CreateBookingData = {
        vehicle_id: formData.vehicle_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        pick_up_location: formData.pick_up_location,
        drop_off_location: formData.drop_off_location,
      };

      const response = await bookingService.createBooking(bookingData);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      console.error('Booking creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiatePayment = useCallback(async (bookingId: number): Promise<PaymentInitiationResponse | null> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await bookingService.initiatePayment(bookingId);
      
      // Redirect to Stripe checkout
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
      
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      console.error('Payment initiation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBookingAndPay = useCallback(async (formData: BookingFormData): Promise<boolean> => {
    try {
      // First create the booking
      const bookingResponse = await createBooking(formData);
      
      if (!bookingResponse) {
        return false;
      }

      // Then initiate payment
      const paymentResponse = await initiatePayment(bookingResponse.booking_id);
      
      return !!paymentResponse;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking and initiate payment';
      setError(errorMessage);
      console.error('Booking and payment error:', err);
      return false;
    }
  }, [createBooking, initiatePayment]);

  const clearError = useCallback(() => setError(''), []);

  return {
    isLoading,
    error,
    createBooking,
    initiatePayment,
    createBookingAndPay,
    clearError,
  };
};
