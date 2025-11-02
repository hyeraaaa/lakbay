"use client"

import { useState, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled || !vehicleId || !startDate) {
      if (mountedRef.current) {
        setTrackingPoints([]);
        setLoading(false);
      }
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchTrackingHistory = async () => {
      if (!mountedRef.current) return;
      
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
        // Reduce limit to prevent excessive memory usage (500 is usually enough for smooth polylines)
        params.append('limit', '500');

        const url = `${API_BASE_URL}/api/tracking/vehicles/${vehicleId}/tracking/history?${params.toString()}`;
        
        const response = await apiRequest(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
        });

        // Check if request was aborted
        if (abortController.signal.aborted || !mountedRef.current) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch tracking history');
        }

        const data = await response.json();
        
        // Check again if component unmounted during async operation
        if (!mountedRef.current) return;
        
        // Handle different response structures
        const trackingHistory = data.data?.tracking_history || data.tracking_history || [];
        
        if (data.success && Array.isArray(trackingHistory) && trackingHistory.length > 0) {
          // Map the tracking history to GPSPoint format
          const points: GPSPoint[] = trackingHistory
            .map((point: TrackingHistoryPoint) => {
              const lat = parseFloat(String(point.latitude));
              const lng = parseFloat(String(point.longitude));
              
              return {
                latitude: lat,
                longitude: lng,
                timestamp: point.gps_timestamp || point.timestamp || '',
                speed: point.speed ? parseFloat(String(point.speed)) : undefined,
                heading: point.heading ? parseFloat(String(point.heading)) : undefined,
              };
            })
            .filter((point: GPSPoint) => {
              return Number.isFinite(point.latitude) && 
                     Number.isFinite(point.longitude) &&
                     point.timestamp !== '';
            })
            // Sort by timestamp ascending for proper polyline order
            .sort((a: GPSPoint, b: GPSPoint) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

          // Check again before setting state
          if (mountedRef.current) {
            setTrackingPoints(points);
          }
        } else {
          if (mountedRef.current) {
            setTrackingPoints([]);
          }
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch tracking history');
          setTrackingPoints([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    };

    fetchTrackingHistory();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [vehicleId, startDate, endDate, enabled]);

  return {
    trackingPoints,
    loading,
    error,
  };
}

