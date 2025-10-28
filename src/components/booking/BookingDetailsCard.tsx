"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Booking, BookingStatus } from '@/services/bookingServices';
import { bookingService } from '@/services/bookingServices';

interface BookingDetailsCardProps {
  booking: Booking;
}

const getStatusColor = (status: BookingStatus) => {
  const statusColors = {
    [BookingStatus.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BookingStatus.AWAITING_OWNER_APPROVAL]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-200',
    [BookingStatus.ON_GOING]: 'bg-purple-100 text-purple-800 border-purple-200',
    [BookingStatus.CANCELED]: 'bg-red-100 text-red-800 border-red-200',
    [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};


export default function BookingDetailsCard({ booking }: BookingDetailsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Booking Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Rental Period</label>
              <p className="text-gray-900">
                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
              </p>
              <p className="text-sm text-gray-500">
                {getDaysDuration()} day{getDaysDuration() !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Pickup Location</label>
              <p className="text-gray-900">{booking.pick_up_location}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Drop-off Location</label>
              <p className="text-gray-900">{booking.drop_off_location}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Booking Status</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(booking.status)} border w-fit`}>
                  {bookingService.utils.getStatusDisplayText(booking.status)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Booked On</label>
              <p className="text-gray-900">{formatDateTime(booking.created_at)}</p>
            </div>

            {booking.cancelled_at && (
              <div>
                <label className="text-sm font-medium text-gray-600">Cancelled On</label>
                <p className="text-red-600">{formatDateTime(booking.cancelled_at)}</p>
              </div>
            )}

            {(booking.cancellation_reason || booking.cancellation_status) && (
              <div className="space-y-1">
                {booking.cancellation_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cancellation Status</label>
                    <p className="text-gray-900 capitalize">{booking.cancellation_status.replaceAll('_', ' ')}</p>
                  </div>
                )}
                {booking.cancellation_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cancellation Reason</label>
                    <p className="text-gray-900 whitespace-pre-line">{booking.cancellation_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
