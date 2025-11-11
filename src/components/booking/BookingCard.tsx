"use client"

import React from 'react';
import { Booking, BookingStatus } from '@/services/bookingServices';
import { Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/services/bookingServices';
import { getImageUrl, getPrimaryImage } from '@/lib/imageUtils';
import Image from 'next/image';

interface BookingCardProps {
  booking: Booking;
  onAction?: (action: string, bookingId: number) => void;
  onAlert?: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void;
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

// Removed status icon rendering from badges per design update


export const BookingCard: React.FC<BookingCardProps> = ({ booking, onAction, onAlert }) => {
  const calculateTotalAmount = () => {
    if (!booking.payment_details || booking.payment_details.length === 0) return 0;
    const payment = booking.payment_details[0];
    return payment?.amount || 0;
  };

  const handleCardClick = () => {
    onAction?.('view', booking.booking_id);
  };

  const hostName = (() => {
    const first = booking.vehicle?.users?.first_name || '';
    const last = booking.vehicle?.users?.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || 'Unknown';
  })();

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
                <p className="text-xs text-gray-600 mt-0.5">{booking.pick_up_location}</p>
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
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-600">
              Host: <span className="font-medium text-gray-800">{hostName}</span>
            </div>
            <div className="flex items-center gap-2">
              
              <Badge className={`${getStatusColor(booking.status)} border flex items-center text-xs`}>
                {bookingService.utils.getStatusDisplayText(booking.status)}
              </Badge>
              {booking.status === BookingStatus.COMPLETED && (!booking.reviews || booking.reviews.length === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onAction?.('review', booking.booking_id); }}
                  className="h-7 px-2 text-xs bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                >
                  <Star className="w-3 h-3 mr-1 text-black" color="black" fill="none" />
                  Leave a Review
                </Button>
              )}
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
              <p className="text-sm text-gray-600 mt-1">{booking.pick_up_location}</p>
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
          </div>

          <div className="text-sm text-gray-600 mb-3">
            <span className="ml-1">{booking.vehicle?.type || 'Vehicle'}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Host: <span className="font-medium text-gray-800">{hostName}</span>
            </div>
            <div className="flex items-center gap-2">
              {booking.status === BookingStatus.COMPLETED && (!booking.reviews || booking.reviews.length === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onAction?.('review', booking.booking_id); }}
                  className="h-8 px-3 text-xs bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                >
                  <Star className="w-3.5 h-3.5 mr-1 text-black" color="black" fill="none" />
                  Leave Review
                </Button>
              )}
              <Badge className={`${getStatusColor(booking.status)} border flex items-center text-xs`}>
                {bookingService.utils.getStatusDisplayText(booking.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
