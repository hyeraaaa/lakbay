import { useState, useEffect } from 'react';
import { vehicleService, VehicleResponse } from '@/services/vehicleServices';

export interface UseVehiclesReturn {
  vehicles: VehicleResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicles(initialParams?: Record<string, string | number | undefined>, shouldFetch: boolean = true, refetchKey?: string | number): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.getAllVehicles(initialParams);
      console.log('Fetched vehicles data:', data);
      console.log('Is array?', Array.isArray(data));
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchVehicles();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialParams), shouldFetch, refetchKey]);

  return {
    vehicles,
    isLoading,
    error,
    refetch: fetchVehicles,
  };
}
