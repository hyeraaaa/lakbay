"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getImageUrl, getPrimaryImage } from '@/lib/imageUtils';
import Image from 'next/image';
import { Car, User } from 'lucide-react';
import { Booking } from '@/services/bookingServices';

interface VehicleInformationCardProps {
  booking: Booking;
}

export default function VehicleInformationCard({ booking }: VehicleInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Image */}
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
            {(() => {
              const primaryImage = getPrimaryImage(booking.vehicle?.vehicle_images);
              const imageUrl = getImageUrl(primaryImage?.url);
              
              return imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${booking.vehicle?.brand || 'Unknown'} ${booking.vehicle?.model || 'Vehicle'}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>No Image Available</span>
                </div>
              );
            })()}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {booking.vehicle?.brand || 'Unknown'} {booking.vehicle?.model || 'Vehicle'}
              </h3>
              <p className="text-gray-600">
                {booking.vehicle?.year || 'N/A'} • {booking.vehicle?.type || 'Vehicle'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">Host:</span>
                <span>{booking.vehicle?.users?.first_name || 'Unknown'} {booking.vehicle?.users?.last_name || ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg font-bold text-gray-600">&#8369;</span>
                <span className="font-medium">Rate:</span>
                <span>&#8369;{booking.vehicle?.rate_per_day || 0}/day</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

