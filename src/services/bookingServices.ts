// services/bookingServices.ts
import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Booking Status Enum
export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  AWAITING_OWNER_APPROVAL = 'awaiting_owner_approval',
  CONFIRMED = 'confirmed',
  ON_GOING = 'on_going',
  CANCELED = 'canceled',
  COMPLETED = 'completed'
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DENIED = 'denied',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  EXPIRED = 'expired'
}

// Booking Interfaces
export interface CreateBookingData {
  vehicle_id: number;
  start_date: string; // ISO 8601 format
  end_date: string; // ISO 8601 format
  pick_up_location: string;
  drop_off_location: string;
}

export interface UpdateBookingData {
  start_date?: string;
  end_date?: string;
  pick_up_location?: string;
  drop_off_location?: string;
}

export interface BookingReview {
  rating: number; // 1-5
  comment?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  vehicle_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  q?: string; // Search query
}

export interface PaymentDetails {
  payment_detail_id: number;
  booking_id: number;
  payment_status: PaymentStatus;
  amount: number;
  days: number;
  fee_amount: number;
  tax_amount: number;
  net_amount: number;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  transaction_date: string;
  updated_at: string;
}

export interface Vehicle {
  vehicle_id: number;
  brand: string;
  model: string;
  year: number;
  rate_per_day: number;
  availability: string;
  owner_id: number;
  type?: string;
  vehicle_images?: Array<{
    url: string;
    alt_text?: string;
  }>;
  users: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_picture?: string;
  };
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_picture?: string;
}

export interface Review {
  review_id: number;
  customer_id: number;
  vehicle_id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  pick_up_location: string;
  drop_off_location: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancellation_requested_at?: string;
  cancellation_approved_at?: string;
  cancellation_status?: string;
  users: User;
  vehicle: Vehicle;
  payment_details: PaymentDetails[];
  reviews: Review[];
}

export interface CreateBookingResponse {
  booking_id: number;
  message: string;
  status: BookingStatus;
}

export interface PaymentInitiationResponse {
  checkout_url: string;
  message?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CancellationResponse {
  message: string;
  refundAmount?: number;
  penaltyAmount?: number;
}

export interface EarlyEndResponse {
  message: string;
  actualDaysUsed: number;
  chargeAmount: number;
  refundAmount: number;
  status: BookingStatus;
  pricingBreakdown: {
    originalTotal: number;
    finalCharge: number;
    refund: number;
    daysUsed: number;
    daysRefunded: number;
  };
}

export interface CheckInResponse {
  message: string;
  payoutProcessed: boolean;
  payoutDetails?: {
    ownerAmountTransferred: number;
    transferCurrency: string;
    platformFee: number;
  };
}

// Booking Service
export const bookingService = {
  // Create a new booking
  createBooking: async (data: CreateBookingData): Promise<CreateBookingResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create booking');
    }

    return response.json();
  },

  // Initiate payment for a booking
  initiatePayment: async (bookingId: number): Promise<PaymentInitiationResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate payment');
    }

    return response.json();
  },

  // Reject a booking (owner only)
  rejectBooking: async (bookingId: number, reason?: string): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject booking');
    }

    return response.json();
  },

  // Approve a booking (owner only)
  approveBooking: async (bookingId: number): Promise<{ message: string }> => {
    console.log(`Attempting to approve booking ${bookingId}`);
    console.log(`API URL: ${API_BASE_URL}/api/bookings/${bookingId}/approve`);
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    // Test backend connectivity first
    try {
      console.log('Testing backend connectivity...');
      const testResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      console.log('Backend connectivity test - Status:', testResponse.status);
      console.log('Backend connectivity test - OK:', testResponse.ok);
      
      if (!testResponse.ok) {
        const testErrorText = await testResponse.text();
        console.log('Backend connectivity test error response:', testErrorText);
      }
    } catch (testError) {
      console.error('Backend connectivity test failed:', testError);
      console.error('This might indicate the backend server is not running or there\'s a network issue');
    }
    
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`Approve booking response status: ${response.status}`);
    console.log(`Approve booking response ok: ${response.ok}`);
    console.log(`Approve booking response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Approve booking error response (JSON):', errorData);
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
        const textResponse = await response.text();
        console.error('Approve booking error response (text):', textResponse);
        errorData = { message: `HTTP ${response.status}: ${textResponse || response.statusText}` };
      }
      
      throw new Error(errorData.message || `Failed to approve booking (HTTP ${response.status})`);
    }

    const result = await response.json();
    console.log('Approve booking success result:', result);
    return result;
  },

  // Complete a booking
  completeBooking: async (bookingId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete booking');
    }

    return response.json();
  },

  // Check out a booking (start the rental)
  checkOut: async (bookingId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check out booking');
    }

    return response.json();
  },

  // Check in a booking (end the rental)
  checkIn: async (bookingId: number): Promise<CheckInResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check in booking');
    }

    return response.json();
  },

  // Get list of bookings with optional filters
  listBookings: async (filters?: BookingFilters): Promise<BookingListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/api/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Making API request to:', url);
    console.log('API Base URL:', API_BASE_URL);
    
    const response = await apiRequest(url, {
      method: 'GET',
    });

    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }

    const data = await response.json();
    console.log('API response data:', data);

    // Expect server-side paginated response only
    if (data && Array.isArray(data.bookings)) {
      return {
        bookings: data.bookings,
        total: data.total ?? data.bookings.length,
        page: data.page ?? (filters?.page || 1),
        limit: data.limit ?? (filters?.limit || 10),
        totalPages: data.totalPages ?? Math.ceil((data.total ?? data.bookings.length) / (data.limit ?? (filters?.limit || 10)))
      } as BookingListResponse;
    }

    throw new Error('Unexpected bookings response shape. Expected paginated object.');
  },

  // Get booking details by ID
  getBookingDetails: async (bookingId: number): Promise<Booking> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch booking details');
    }

    return response.json();
  },

  // Update a booking
  updateBooking: async (bookingId: number, data: UpdateBookingData): Promise<Booking> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update booking');
    }

    return response.json();
  },

  // Cancel a booking
  cancelBooking: async (bookingId: number, reason?: string): Promise<CancellationResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel booking');
    }

    return response.json();
  },

  // Approve cancellation (owner only)
  approveCancellation: async (bookingId: number): Promise<CancellationResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/cancel/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve cancellation');
    }

    return response.json();
  },

  // Reject cancellation (owner only)
  rejectCancellation: async (bookingId: number): Promise<CancellationResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/cancel/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject cancellation');
    }

    return response.json();
  },

  // Leave a review for a completed booking
  leaveReview: async (bookingId: number, review: BookingReview): Promise<Review> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit review');
    }

    return response.json();
  },

  // End booking early
  endEarly: async (bookingId: number): Promise<EarlyEndResponse> => {
    const response = await apiRequest(`${API_BASE_URL}/api/bookings/${bookingId}/end-early`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to end booking early');
    }

    return response.json();
  },

  // Utility functions
  utils: {
    // Check if booking can be cancelled
    canCancelBooking: (booking: Booking): boolean => {
      return booking.status !== BookingStatus.ON_GOING && 
             booking.status !== BookingStatus.COMPLETED &&
             booking.status !== BookingStatus.CANCELED &&
             // Disallow further cancellations if there's any cancellation workflow already
             !booking.cancellation_status;
    },

    // Check if booking can be updated
    canUpdateBooking: (booking: Booking): boolean => {
      const now = new Date();
      const startDate = new Date(booking.start_date);
      const timeUntilStart = startDate.getTime() - now.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      return booking.status === BookingStatus.PENDING_PAYMENT && 
             timeUntilStart >= oneDayInMs &&
             !booking.updated_at || new Date(booking.updated_at) <= new Date(booking.created_at);
    },

    // Check if booking can be reviewed
    canReviewBooking: (booking: Booking, userId: number): boolean => {
      return booking.status === BookingStatus.COMPLETED &&
             booking.user_id === userId &&
             (!booking.reviews || booking.reviews.length === 0);
    },

    // Check if booking can be checked out
    canCheckOut: (booking: Booking, userId: number): boolean => {
      return booking.status === BookingStatus.CONFIRMED &&
             booking.vehicle?.owner_id === userId;
    },

    // Check if booking can be checked in
    canCheckIn: (booking: Booking, userId: number): boolean => {
      return booking.status === BookingStatus.ON_GOING &&
             (booking.user_id === userId || booking.vehicle?.owner_id === userId);
    },

    // Check if booking can be ended early
    canEndEarly: (booking: Booking, userId: number): boolean => {
      return booking.status === BookingStatus.ON_GOING &&
             (booking.user_id === userId || booking.vehicle?.owner_id === userId);
    },

    // Get booking status display text
    getStatusDisplayText: (status: BookingStatus): string => {
      const statusMap: Record<BookingStatus, string> = {
        [BookingStatus.PENDING_PAYMENT]: 'Pending Payment',
        [BookingStatus.AWAITING_OWNER_APPROVAL]: 'Awaiting Owner Approval',
        [BookingStatus.CONFIRMED]: 'Confirmed',
        [BookingStatus.ON_GOING]: 'On Going',
        [BookingStatus.CANCELED]: 'Canceled',
        [BookingStatus.COMPLETED]: 'Completed'
      };
      return statusMap[status] || status;
    },

    // Get payment status display text
    getPaymentStatusDisplayText: (status: PaymentStatus): string => {
      const statusMap: Record<PaymentStatus, string> = {
        [PaymentStatus.PENDING]: 'Pending',
        [PaymentStatus.COMPLETED]: 'Completed',
        [PaymentStatus.DENIED]: 'Denied',
        [PaymentStatus.REFUNDED]: 'Refunded',
        [PaymentStatus.PARTIALLY_REFUNDED]: 'Partially Refunded',
        [PaymentStatus.EXPIRED]: 'Expired'
      };
      return statusMap[status] || status;
    },

    // Calculate booking duration in days
    calculateBookingDuration: (startDate: string, endDate: string): number => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    },

    // Format booking dates for display
    formatBookingDates: (startDate: string, endDate: string): string => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    },

    // Check if booking is in free cancellation window
    isInFreeCancellationWindow: (booking: Booking): boolean => {
      const now = new Date();
      const createdAt = new Date(booking.created_at);
      const startDate = new Date(booking.start_date);
      
      const within24hOfCreation = (now.getTime() - createdAt.getTime()) <= 24 * 60 * 60 * 1000;
      const startAtLeast24hAway = (startDate.getTime() - now.getTime()) >= 24 * 60 * 60 * 1000;
      
      return within24hOfCreation && startAtLeast24hAway;
    }
  }
};

export default bookingService;
