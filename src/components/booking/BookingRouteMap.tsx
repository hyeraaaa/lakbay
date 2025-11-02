"use client"

import React, { useMemo, memo } from "react";
import dynamic from 'next/dynamic';
import { Booking } from "@/services/bookingServices";
import { useVehicleLiveLocation } from "@/hooks/cars/useVehicleLiveLocation";
import { useBookingTrackingHistory } from "@/hooks/booking/useBookingTrackingHistory";

// Dynamically import the map component to avoid SSR issues with Leaflet
// TypeScript may show an error here, but the module exists and works at runtime
const BookingRouteMapInner = dynamic(
  () => import('./BookingRouteMapInner').catch((err) => {
    console.error('Error loading BookingRouteMapInner:', err);
    // Return a fallback component if import fails
    return { default: () => <div>Error loading map</div> };
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[22rem] md:h-[28rem] lg:h-[40rem] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
) as React.ComponentType<{
  vehicle: Booking['vehicle'];
  liveLocation: { latitude: number; longitude: number } | null;
  routeCoordinates: [number, number][];
  mapCenter: [number, number];
  showControls?: boolean;
  hasTrackingDevice?: boolean | null;
}>;

interface BookingRouteMapProps {
  booking: Booking;
}

function BookingRouteMap({ booking }: BookingRouteMapProps) {
  const vehicleId = booking.vehicle.vehicle_id;
  const isCompleted = booking.status === 'completed';
  const isOngoing = booking.status === 'on_going';
  
  // Only use live location for ongoing bookings to prevent unnecessary socket connections
  const { hasTrackingDevice, liveLocation, initialLoading, isLive } = useVehicleLiveLocation(
    isOngoing ? vehicleId : null
  );

  // Track from checkout_timestamp when GPS tracking actually begins
  // If no checkout_timestamp, fall back to start_date (but GPS data may not exist)
  const startDate = booking.checkout_timestamp || booking.start_date;
  // For ongoing bookings, use current time as end date; for completed, use checkin timestamp or end_date
  const endDate = isOngoing 
    ? undefined // Will default to current time in the hook
    : booking.checkin_timestamp || booking.end_date;

  // Fetch GPS tracking history for the booking period
  const { trackingPoints, loading: trackingLoading, error: trackingError } = useBookingTrackingHistory({
    vehicleId,
    startDate,
    endDate,
    enabled: Boolean(startDate && vehicleId),
  });

  // Prepare polyline coordinates from tracking points - memoized to prevent unnecessary recalculations
  const routeCoordinates = useMemo(() => {
    if (trackingPoints.length === 0) {
      return [];
    }
    
    // Only create coordinates array - removed expensive logging
    return trackingPoints.map(point => [point.latitude, point.longitude] as [number, number]);
  }, [trackingPoints]);

  // Get map center - prioritize live location, then last tracking point, then vehicle garage location
  const mapCenter = useMemo(() => {
    if (liveLocation) {
      return [liveLocation.latitude, liveLocation.longitude] as [number, number];
    }
    if (trackingPoints.length > 0) {
      const lastPoint = trackingPoints[trackingPoints.length - 1];
      return [lastPoint.latitude, lastPoint.longitude] as [number, number];
    }
    if (booking.vehicle.garage_latitude && booking.vehicle.garage_longitude) {
      return [
        Number(booking.vehicle.garage_latitude),
        Number(booking.vehicle.garage_longitude)
      ] as [number, number];
    }
    return null;
  }, [liveLocation, trackingPoints, booking.vehicle.garage_latitude, booking.vehicle.garage_longitude]);

  const getStatusText = () => {
    if (initialLoading || trackingLoading) return "Loading location...";
    
    // For completed bookings, always show route history, not live location
    if (isCompleted) {
      if (trackingPoints.length > 0) return "Completed booking route";
      return "Booking completed";
    }
    
    // For ongoing bookings, show live status
    if (isOngoing) {
      if (isLive) return "Live location";
      if (liveLocation && !isLive) return "Last known location";
      if (hasTrackingDevice) return "Waiting for device...";
      if (trackingPoints.length > 0) return "Active route";
    }
    
    // Default statuses
    if (trackingPoints.length > 0) return "Route history";
    if (hasTrackingDevice) return "Waiting for device...";
    return "Garage location";
  };

  const getStatusStyling = () => {
    if (initialLoading || trackingLoading) return "bg-blue-100 text-blue-700";
    
    // For completed bookings
    if (isCompleted) {
      if (trackingPoints.length > 0) return "bg-purple-100 text-purple-700";
      return "bg-gray-100 text-gray-600";
    }
    
    // For ongoing bookings
    if (isOngoing) {
      if (isLive) return "bg-green-100 text-green-700";
      if (liveLocation && !isLive) return "bg-yellow-100 text-yellow-700";
      if (hasTrackingDevice) return "bg-gray-100 text-gray-600";
      if (trackingPoints.length > 0) return "bg-blue-100 text-blue-700";
    }
    
    // Default styling
    if (trackingPoints.length > 0) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Vehicle Location & Route</h3>
        {hasTrackingDevice !== null && (
          <span className={`text-xs px-2 py-1 rounded ${getStatusStyling()}`}>
            {getStatusText()}
          </span>
        )}
      </div>
      
      {trackingError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p>Note: Unable to load complete route history. Showing available location data.</p>
        </div>
      )}

      {booking.vehicle && mapCenter && (
        <div className="h-[22rem] md:h-[28rem] lg:h-[40rem] overflow-hidden rounded-lg border border-gray-200">
          <BookingRouteMapInner
            vehicle={booking.vehicle}
            liveLocation={liveLocation}
            routeCoordinates={routeCoordinates}
            mapCenter={mapCenter}
            showControls={true}
            hasTrackingDevice={hasTrackingDevice}
          />
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(BookingRouteMap);

