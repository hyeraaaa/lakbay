"use client"

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useJWT } from '@/contexts/JWTContext';
import BookingDetailsSkeleton from '@/components/booking/BookingDetailsSkeleton';
import { 
  VehicleInformationCard, 
  BookingDetailsCard, 
  PaymentSummaryCard, 
  BookingReviewCard 
} from '@/components/booking';
import OwnerBookingActionsCard from '@/components/booking/OwnerBookingActionsCard';
import { useBookingDetails } from '@/hooks/booking';

export default function OwnerBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useJWT();
  const bookingId = params.id as string;
  
  const { booking, loading, error, handleAction } = useBookingDetails({ bookingId });

  if (authLoading) {
    return <BookingDetailsSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <BookingDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-sm text-gray-600">Manage this vehicle booking</p>
        </div>
      </div>

      {/* Cancellation banner removed as requested */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-0">
          <VehicleInformationCard booking={booking} />
          <div className="h-px bg-border mx-6" />
          <BookingDetailsCard booking={booking} />
          <BookingReviewCard booking={booking} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PaymentSummaryCard booking={booking} />
          <OwnerBookingActionsCard booking={booking} onAction={handleAction} />
        </div>
      </div>
    </div>
  );
}
