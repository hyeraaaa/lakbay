"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Navigation,
  Settings,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Booking, BookingStatus, bookingService } from '@/services/bookingServices';

interface MileageTrackingCardProps {
  booking: Booking;
  onBookingUpdate?: (updatedBooking: Booking) => void;
}

const getVerificationStatusColor = (status?: string) => {
  const statusColors = {
    'gps_verified': 'bg-green-100 text-green-800 border-green-200',
    'gps_used_with_discrepancy': 'bg-yellow-100 text-yellow-800 border-yellow-200',     
    'odometer_used': 'bg-blue-100 text-blue-800 border-blue-200',
    'needs_review': 'bg-orange-100 text-orange-800 border-orange-200',
    'gps_failed_no_odometer': 'bg-red-100 text-red-800 border-red-200'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getVerificationStatusText = (status?: string) => {
  const statusTexts = {
    'gps_verified': 'GPS Verified',
    'gps_used_with_discrepancy': 'GPS Used (Minor Discrepancy)',
    'odometer_used': 'Odometer Used',
    'needs_review': 'Needs Review',
    'gps_failed_no_odometer': 'GPS Failed'
  };
  return statusTexts[status as keyof typeof statusTexts] || 'Unknown';
};

export default function MileageTrackingCard({ booking, onBookingUpdate }: MileageTrackingCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [currentBooking, setCurrentBooking] = useState<Booking>(booking);
  
  // Update current booking when prop changes
  useEffect(() => {
    setCurrentBooking(booking);
    // Debug logging to help identify mileage data issues
    console.log('MileageTrackingCard - Booking updated:', {
      bookingId: booking.booking_id,
      status: booking.status,
      total_mileage_used: booking.total_mileage_used,
      gps_distance_km: booking.gps_distance_km,
      overage_mileage: booking.overage_mileage,
      overage_amount: booking.overage_amount
    });
  }, [booking]);
  
  const isActive = currentBooking.status === BookingStatus.ON_GOING;
  const isCompleted = currentBooking.status === BookingStatus.COMPLETED;
  const hasMileageData = (currentBooking.total_mileage_used !== undefined && currentBooking.total_mileage_used !== null) || 
                        (currentBooking.gps_distance_km !== undefined && currentBooking.gps_distance_km !== null);
  
  // Auto-refresh functionality for active bookings
  useEffect(() => {
    if (!isActive) return;

    const refreshInterval = setInterval(async () => {
      try {
        const updatedBooking = await bookingService.getBookingDetails(currentBooking.booking_id);
        setCurrentBooking(updatedBooking);
        setLastRefresh(new Date());
        onBookingUpdate?.(updatedBooking);
      } catch (error) {
        console.error('Failed to refresh mileage data:', error);
      }
    }, 45000); // Refresh every 45 seconds

    return () => clearInterval(refreshInterval);
  }, [isActive, currentBooking.booking_id, onBookingUpdate]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const updatedBooking = await bookingService.getBookingDetails(currentBooking.booking_id);
      setCurrentBooking(updatedBooking);
      setLastRefresh(new Date());
      onBookingUpdate?.(updatedBooking);
    } catch (error) {
      console.error('Failed to refresh mileage data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate days for allowed mileage
  const getDaysDuration = () => {
    const start = new Date(currentBooking.start_date);
    const end = new Date(currentBooking.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = getDaysDuration();
  const dailyLimit = currentBooking.vehicle.daily_mileage_limit || 200; // Default 200km
  const allowedMileage = days * dailyLimit;
  // Calculate current mileage with proper null/undefined handling
  const currentMileage = (() => {
    // For completed bookings, prioritize total_mileage_used (final calculated value)
    if (isCompleted && currentBooking.total_mileage_used !== undefined && currentBooking.total_mileage_used !== null) {
      return currentBooking.total_mileage_used;
    }
    // For ongoing bookings, use total_mileage_used if available (real-time calculation)
    if (currentBooking.total_mileage_used !== undefined && currentBooking.total_mileage_used !== null) {
      return currentBooking.total_mileage_used;
    }
    // Fallback to GPS distance
    if (currentBooking.gps_distance_km !== undefined && currentBooking.gps_distance_km !== null) {
      return currentBooking.gps_distance_km;
    }
    return 0;
  })();
  
  // Debug logging for mileage calculation
  console.log('MileageTrackingCard - Mileage calculation:', {
    total_mileage_used: currentBooking.total_mileage_used,
    gps_distance_km: currentBooking.gps_distance_km,
    calculated_currentMileage: currentMileage,
    hasMileageData
  });
  const overageMileage = Number(currentBooking.overage_mileage || 0);
  const overageAmount = Number(currentBooking.overage_amount || 0);
  const usagePercentage = allowedMileage > 0 ? (currentMileage / allowedMileage) * 100 : 0;

  // Format timestamps
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get GPS reliability indicator
  const getGPSReliability = () => {
    if (!currentBooking.gps_reliable) return { text: 'Low', color: 'text-red-600' };
    if (currentBooking.gps_data_points && currentBooking.gps_data_points > 1000) return { text: 'High', color: 'text-green-600' };
    return { text: 'Medium', color: 'text-yellow-600' };
  };

  const gpsReliability = getGPSReliability();

  // Format last refresh time
  const formatLastRefresh = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isActive ? <Activity className="w-5 h-5 text-black" /> : <Navigation className="w-5 h-5" />}
            {isActive ? 'Live Mileage Tracking' : 'Mileage Tracking'}
          </CardTitle>
          {isActive && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <Badge className={isActive ? 'bg-blue-100 text-blue-800' : isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {isActive ? 'Live Tracking' : isCompleted ? 'Completed' : 'Not Started'}
          </Badge>
        </div>

        {/* Mileage Progress */}
        {hasMileageData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance Traveled</span>
                <span className="font-medium">{currentMileage.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trip Allowance</span>
                <span className="font-medium">
                  {currentBooking.vehicle.daily_mileage_limit ? `${allowedMileage} km total` : 'Unlimited'}
                </span>
              </div>
            </div>

            {currentBooking.vehicle.daily_mileage_limit && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(usagePercentage, 100)} 
                    className="h-2 [&>div]:bg-blue-500"
                  />
                </div>

                {/* Overage Information */}
                {overageMileage > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-orange-800">Mileage Overage</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-700">Overage Distance:</span>
                        <span className="font-medium text-orange-800">{overageMileage} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Overage Fee:</span>
                        <span className="font-medium text-orange-800">₱{overageAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Rate:</span>
                        <span className="font-medium text-orange-800">₱{currentBooking.vehicle.overage_fee_per_km || 5}/km</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Vehicle Mileage Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Vehicle Mileage Settings
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Daily Rate:</span>
              <p className="font-medium">
                {currentBooking.vehicle.daily_mileage_limit ? `${currentBooking.vehicle.daily_mileage_limit} km/day` : 'Unlimited'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Overage Fee:</span>
              <p className="font-medium">₱{currentBooking.vehicle.overage_fee_per_km || 5}/km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
