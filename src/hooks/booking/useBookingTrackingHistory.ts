"use client"

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

interface TrackingHistoryPoint {
  latitude: string | number;
  longitude: string | number;
  gps_timestamp?: string;
  timestamp?: string;
  speed?: string | number;
  heading?: string | number;
}

interface UseBookingTrackingHistoryProps {
  vehicleId: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  enabled?: boolean;
}

export function useBookingTrackingHistory({
  vehicleId,
  startDate,
  endDate,
  enabled = true
}: UseBookingTrackingHistoryProps) {
  const [trackingPoints, setTrackingPoints] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !vehicleId || !startDate) {
      setTrackingPoints([]);
      return;
    }

    const fetchTrackingHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) {
          params.append('startDate', startDate);
        }
        if (endDate) {
          params.append('endDate', endDate);
        } else {
          // If no end date, use current time
          params.append('endDate', new Date().toISOString());
        }
        // Increase limit to get more points for smoother polyline
        params.append('limit', '1000');

        const url = `${API_BASE_URL}/api/tracking/vehicles/${vehicleId}/tracking/history?${params.toString()}`;
        
        const response = await apiRequest(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tracking history');
        }

        const data = await response.json();
        
        // Handle different response structures
        // API may return { success: true, data: { tracking_history: [...] } }
        // or { success: true, tracking_history: [...] }
        const trackingHistory = data.data?.tracking_history || data.tracking_history || [];
        
        console.log('GPS Tracking History Response:', {
          success: data.success,
          historyLength: trackingHistory.length,
          samplePoint: trackingHistory[0],
          responseStructure: {
            hasData: !!data.data,
            hasTrackingHistory: !!data.tracking_history,
            hasDataTrackingHistory: !!data.data?.tracking_history
          }
        });
        
        if (data.success && Array.isArray(trackingHistory) && trackingHistory.length > 0) {
          // Map the tracking history to GPSPoint format
          const points: GPSPoint[] = trackingHistory
            .map((point: TrackingHistoryPoint) => {
              const lat = parseFloat(String(point.latitude));
              const lng = parseFloat(String(point.longitude));
              const timestamp = point.gps_timestamp || point.timestamp || new Date().toISOString();
              
              return {
                latitude: lat,
                longitude: lng,
                timestamp: timestamp,
                speed: point.speed ? parseFloat(String(point.speed)) : undefined,
                heading: point.heading ? parseFloat(String(point.heading)) : undefined,
              };
            })
            .filter((point) => {
              const isValid = 
                Number.isFinite(point.latitude) && 
                Number.isFinite(point.longitude) &&
                point.timestamp != null;
              if (!isValid) {
                console.warn('Invalid GPS point filtered out:', point);
              }
              return isValid;
            })
            // Sort by timestamp ascending for proper polyline order
            .sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

          console.log('Processed GPS Points for Polyline:', {
            totalPoints: points.length,
            firstPoint: points[0],
            lastPoint: points[points.length - 1],
            coordinates: points.map(p => [p.latitude, p.longitude])
          });

          setTrackingPoints(points);
        } else {
          console.warn('No tracking history in response or invalid format:', data);
          setTrackingPoints([]);
        }
      } catch (err) {
        console.error('Error fetching tracking history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tracking history');
        setTrackingPoints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingHistory();
  }, [vehicleId, startDate, endDate, enabled]);

  return {
    trackingPoints,
    loading,
    error,
  };
}

