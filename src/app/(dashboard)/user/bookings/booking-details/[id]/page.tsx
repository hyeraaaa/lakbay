"use client"

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useJWT } from '@/contexts/JWTContext';
import BookingDetailsSkeleton from '@/components/booking/BookingDetailsSkeleton';
import { 
  VehicleInformationCard, 
  BookingDetailsCard, 
  PaymentSummaryCard, 
  BookingActionsCard, 
  BookingReviewCard,
  MileageTrackingCard
} from '@/components/booking';
import { useBookingDetails } from '@/hooks/booking';
import { decodeId } from '@/lib/idCodec';


export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useJWT();
  const encodedId = params.id as string;
  
  // Decode the encrypted ID from the URL
  const bookingId = decodeId(encodedId);
  
  const { booking, loading, error, handleAction } = useBookingDetails({ bookingId: bookingId || '' });

  if (authLoading) {
    return <BookingDetailsSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!bookingId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid booking ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <BookingDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-primary">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/user/bookings" className="hover:text-primary">
                Bookings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Booking Details</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <VehicleInformationCard booking={booking} />
          <BookingDetailsCard booking={booking} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PaymentSummaryCard booking={booking} onAction={handleAction} />
          {booking.status === 'on_going' ? (
            <MileageTrackingCard 
              booking={booking} 
              onBookingUpdate={(updatedBooking) => {
                // Update the booking state in the parent component
                // This will be handled by the useBookingDetails hook
              }}
            />
          ) : booking.status === 'completed' ? (
            <>
              <MileageTrackingCard 
                booking={booking} 
                onBookingUpdate={(updatedBooking) => {
                  // Update the booking state in the parent component
                  // This will be handled by the useBookingDetails hook
                }}
              />
              {booking.reviews && booking.reviews.length > 0 ? (
                <BookingReviewCard booking={booking} />
              ) : user?.user_type !== 'admin' ? (
                <BookingActionsCard booking={booking} onAction={handleAction} />
              ) : null}
            </>
          ) : (
            <>
              {booking.reviews && booking.reviews.length > 0 ? (
                <BookingReviewCard booking={booking} />
              ) : user?.user_type !== 'admin' ? (
                <BookingActionsCard booking={booking} onAction={handleAction} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
