"use client"

import React from 'react';
import { Booking, BookingStatus, PaymentStatus } from '@/services/bookingServices';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { bookingService } from '@/services/bookingServices';
import { getImageUrl, getPrimaryImage } from '@/lib/imageUtils';
import Image from 'next/image';

interface OwnerBookingCardProps {
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

const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING_PAYMENT:
      return <AlertCircle className="w-4 h-4" />;
    case BookingStatus.AWAITING_OWNER_APPROVAL:
      return <Clock className="w-4 h-4" />;
    case BookingStatus.CONFIRMED:
      return <CheckCircle className="w-4 h-4" />;
    case BookingStatus.ON_GOING:
      return <Clock className="w-4 h-4" />;
    case BookingStatus.CANCELED:
      return <XCircle className="w-4 h-4" />;
    case BookingStatus.COMPLETED:
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
  const statusColors = {
    [PaymentStatus.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200',
    [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    [PaymentStatus.DENIED]: 'bg-red-100 text-red-800 border-red-200',
    [PaymentStatus.REFUNDED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [PaymentStatus.PARTIALLY_REFUNDED]: 'bg-orange-100 text-orange-800 border-orange-200',
    [PaymentStatus.EXPIRED]: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const OwnerBookingCard: React.FC<OwnerBookingCardProps> = ({ 
  booking
}) => {
  const calculateTotalAmount = () => {
    if (!booking.payment_details || booking.payment_details.length === 0) return 0;
    const payment = booking.payment_details[0];
    return payment?.amount || 0;
  };

  const handleCardClick = () => {
    // Navigate to owner booking details page
    window.location.href = `/owner/bookings/booking-details/${booking.booking_id}`;
  };


  return (
    <div 
      className="w-full bg-white rounded-xl border border-border h-full cursor-pointer group overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Large and medium screens: horizontal layout */}
      <div className="hidden sm:flex h-32">
        <div className="w-40 flex-shrink-0 relative">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {(() => {
              const primaryImage = getPrimaryImage(booking.vehicle?.vehicle_images);
              const imageUrl = getImageUrl(primaryImage?.url);
              
              return imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${booking.vehicle?.brand || 'Unknown'} ${booking.vehicle?.model || 'Vehicle'}`}
                  width={160}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl, e);
                  }}
                />
              ) : (
                <div className="text-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {booking.vehicle?.brand || 'Unknown'} {booking.vehicle?.model || 'Vehicle'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {booking.users?.first_name} {booking.users?.last_name}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">₱{calculateTotalAmount().toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {booking.payment_details?.[0]?.days || 1} day{(booking.payment_details?.[0]?.days || 1) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                  {new Date(booking.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[8rem]">{booking.pick_up_location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(booking.status)} border flex items-center gap-1 text-xs`}>
                {getStatusIcon(booking.status)}
                {bookingService.utils.getStatusDisplayText(booking.status)}
              </Badge>
              {booking.payment_details?.[0] && (
                <Badge className={`${getPaymentStatusColor(booking.payment_details[0].payment_status)} border text-xs`}>
                  {bookingService.utils.getPaymentStatusDisplayText(booking.payment_details[0].payment_status)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Actions removed - only available in booking details */}
            </div>
          </div>
        </div>
      </div>

      {/* Small screens only: vertical layout */}
      <div className="sm:hidden">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {(() => {
              const primaryImage = getPrimaryImage(booking.vehicle?.vehicle_images);
              const imageUrl = getImageUrl(primaryImage?.url);
              
              return imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${booking.vehicle?.brand || 'Unknown'} ${booking.vehicle?.model || 'Vehicle'}`}
                  width={400}
                  height={192}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl, e);
                  }}
                />
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-500">No Image</span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {booking.vehicle?.brand || 'Unknown'} {booking.vehicle?.model || 'Vehicle'}
              </h3>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <User className="w-4 h-4" />
                {booking.users?.first_name} {booking.users?.last_name}
              </p>
            </div>
            <div className="text-right ml-3">
              <div className="font-bold text-gray-900 text-lg">₱{calculateTotalAmount().toLocaleString()}</div>
              <div className="text-sm text-gray-500">
                {booking.payment_details?.[0]?.days || 1} day{(booking.payment_details?.[0]?.days || 1) !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {new Date(booking.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{booking.pick_up_location}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-800">{booking.vehicle?.year || 'N/A'}</span> • 
            <span className="ml-1">{booking.vehicle?.type || 'Vehicle'}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(booking.status)} border flex items-center gap-1 text-xs`}>
                {getStatusIcon(booking.status)}
                {bookingService.utils.getStatusDisplayText(booking.status)}
              </Badge>
              {booking.payment_details?.[0] && (
                <Badge className={`${getPaymentStatusColor(booking.payment_details[0].payment_status)} border text-xs`}>
                  {bookingService.utils.getPaymentStatusDisplayText(booking.payment_details[0].payment_status)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Actions removed - only available in booking details */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
