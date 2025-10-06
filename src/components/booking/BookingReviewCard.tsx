"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl } from '@/lib/imageUtils';
import { Booking } from '@/services/bookingServices';

interface BookingReviewCardProps {
  booking: Booking;
}

export default function BookingReviewCard({ booking }: BookingReviewCardProps) {
  // Don't show if no reviews
  if (!booking.reviews || booking.reviews.length === 0) {
    return null;
  }

  const review = booking.reviews[0];
  const displayName = booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'You';
  const initials = displayName.trim().charAt(0).toUpperCase() || 'Y';
  const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getProfileImageUrl(booking.users?.profile_picture)} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 text-yellow-400 ${i < (review?.rating || 0) ? 'fill-yellow-400' : ''}`} />
              ))}
            </div>
            <div className="text-sm text-gray-700 font-medium">
              {displayName}
              {reviewDate && <span className="text-gray-500 font-normal"> • {reviewDate}</span>}
            </div>
            {review?.comment && (
              <p className="mt-3 text-gray-800 leading-relaxed">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

