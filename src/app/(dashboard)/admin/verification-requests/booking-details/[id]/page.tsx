"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import BookingDetailsSkeleton from '@/components/booking/BookingDetailsSkeleton'
import { 
  VehicleInformationCard, 
  BookingDetailsCard, 
  PaymentSummaryCard, 
  BookingReviewCard,
  MileageTrackingCard
} from '@/components/booking'
import { useBookingDetails } from '@/hooks/booking'
import { decodeId } from '@/lib/idCodec'

export default function AdminBookingDetailsPage() {
  const params = useParams()
  const encodedId = params.id as string
  const bookingId = decodeId(encodedId)

  const { booking, loading, error, handleAction } = useBookingDetails({ bookingId: bookingId || '' })

  if (!bookingId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid booking ID</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return <BookingDetailsSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
      </div>
    )
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
              <BreadcrumbLink href="/admin/verification-requests" className="hover:text-primary">
                Verification Requests
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
          <PaymentSummaryCard booking={booking} />
          {/* In admin view we show review card if present; no user actions */}
          {booking.reviews && booking.reviews.length > 0 ? (
            <BookingReviewCard booking={booking} />
          ) : null}
          {booking.status === 'on_going' || booking.status === 'completed' ? (
            <MileageTrackingCard 
              booking={booking} 
              onBookingUpdate={() => {}}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}


