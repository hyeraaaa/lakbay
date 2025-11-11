import { useState, useEffect, useCallback } from 'react';
import { businessHoursService, BusinessHour, formatBusinessHours, getDayDisplayName, getAllDays } from '@/services/businessHoursService';
import { getCurrentUser } from '@/lib/jwt';

interface UseBusinessHoursOptions {
  ownerId?: number; // If provided, fetch for specific owner (public), otherwise fetch own hours
  autoFetch?: boolean; // Whether to automatically fetch on mount
}

interface UseBusinessHoursReturn {
  businessHours: BusinessHour[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBusinessHours: (hours: BusinessHour[]) => Promise<BusinessHour[]>;
  updateDayHours: (dayOfWeek: string, updateData: {
    is_open: boolean;
    opening_time?: string | null;
    closing_time?: string | null;
  }) => Promise<void>;
  deleteBusinessHours: () => Promise<void>;
  deleteDayHours: (dayOfWeek: string) => Promise<void>;
  isOwner: boolean;
}

export const useBusinessHours = (options: UseBusinessHoursOptions = {}): UseBusinessHoursReturn => {
  const { ownerId, autoFetch = true } = options;
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user to determine user type
  const currentUser = getCurrentUser();
  const userType = currentUser?.user_type || 'customer';
  const currentUserId = currentUser?.id ? parseInt(currentUser.id) : null;
  
  // Check if ownerId matches current user (viewing own profile)
  const isViewingOwnProfile = ownerId !== undefined && currentUserId !== null && ownerId === currentUserId;
  
  // Determine if this is owner mode (can edit) or customer mode (read-only)
  // Allow editing if: no ownerId provided (own hours) OR ownerId matches current user (viewing own profile)
  const isOwner = (!ownerId || isViewingOwnProfile) && userType === 'owner';

  const fetchBusinessHours = useCallback(async () => {
    if (!autoFetch) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let hours: BusinessHour[];
      
      if (ownerId && !isViewingOwnProfile) {
        // Fetch for specific owner (public view - works for customers viewing other owners)
        hours = await businessHoursService.getBusinessHoursByOwnerId(ownerId);
      } else if (userType === 'owner') {
        // Fetch own business hours (authenticated owner)
        // This handles both: no ownerId OR viewing own profile with ownerId
        hours = await businessHoursService.getOwnBusinessHours();
      } else {
        // Customer trying to view without specific owner - show empty state
        setBusinessHours([]);
        setLoading(false);
        return;
      }
      
      setBusinessHours(hours);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business hours';
      setError(errorMessage);
      console.error('Error fetching business hours:', err);
    } finally {
      setLoading(false);
    }
  }, [ownerId, autoFetch, userType, isViewingOwnProfile]);

  const updateBusinessHours = useCallback(async (hours: BusinessHour[]): Promise<BusinessHour[]> => {
    // Allow update if: no ownerId (own hours) OR ownerId matches current user (viewing own profile)
    if (ownerId && !isViewingOwnProfile) {
      throw new Error('Cannot update business hours for another owner');
    }
    
    if (userType !== 'owner') {
      throw new Error('Only owners can update business hours');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedHours = await businessHoursService.upsertBusinessHours(hours);
      setBusinessHours(updatedHours);
      return updatedHours; // Return the updated hours for potential use
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update business hours';
      setError(errorMessage);
      console.error('Error updating business hours:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ownerId, userType, isViewingOwnProfile]);

  const updateDayHours = useCallback(async (dayOfWeek: string, updateData: {
    is_open: boolean;
    opening_time?: string | null;
    closing_time?: string | null;
  }) => {
    // Allow update if: no ownerId (own hours) OR ownerId matches current user (viewing own profile)
    if (ownerId && !isViewingOwnProfile) {
      throw new Error('Cannot update business hours for another owner');
    }
    
    if (userType !== 'owner') {
      throw new Error('Only owners can update business hours');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedHour = await businessHoursService.updateBusinessHoursForDay(dayOfWeek, updateData);
      
      // Update the specific day in our state
      setBusinessHours(prev => 
        prev.map(hour => 
          hour.day_of_week === dayOfWeek ? updatedHour : hour
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update day hours';
      setError(errorMessage);
      console.error('Error updating day hours:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ownerId, userType, isViewingOwnProfile]);

  const deleteBusinessHours = useCallback(async () => {
    // Allow delete if: no ownerId (own hours) OR ownerId matches current user (viewing own profile)
    if (ownerId && !isViewingOwnProfile) {
      throw new Error('Cannot delete business hours for another owner');
    }
    
    if (userType !== 'owner') {
      throw new Error('Only owners can delete business hours');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await businessHoursService.deleteBusinessHours();
      setBusinessHours([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete business hours';
      setError(errorMessage);
      console.error('Error deleting business hours:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ownerId, userType, isViewingOwnProfile]);

  const deleteDayHours = useCallback(async (dayOfWeek: string) => {
    // Allow delete if: no ownerId (own hours) OR ownerId matches current user (viewing own profile)
    if (ownerId && !isViewingOwnProfile) {
      throw new Error('Cannot delete business hours for another owner');
    }
    
    if (userType !== 'owner') {
      throw new Error('Only owners can delete business hours');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await businessHoursService.deleteBusinessHoursForDay(dayOfWeek);
      
      // Remove the specific day from our state
      setBusinessHours(prev => 
        prev.filter(hour => hour.day_of_week !== dayOfWeek)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete day hours';
      setError(errorMessage);
      console.error('Error deleting day hours:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ownerId, userType, isViewingOwnProfile]);

  const refetch = useCallback(async () => {
    await fetchBusinessHours();
  }, [fetchBusinessHours]);

  useEffect(() => {
    fetchBusinessHours();
  }, [fetchBusinessHours]);

  return {
    businessHours,
    loading,
    error,
    refetch,
    updateBusinessHours,
    updateDayHours,
    deleteBusinessHours,
    deleteDayHours,
    isOwner,
  };
};

// Hook for checking owner status
export const useOwnerStatus = (ownerId: number) => {
  const [status, setStatus] = useState<{
    is_open: boolean;
    message: string;
    current_time: string;
    current_day: string;
    opening_time?: string;
    closing_time?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statusData = await businessHoursService.checkOwnerStatus(ownerId);
      setStatus(statusData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check owner status';
      setError(errorMessage);
      console.error('Error checking owner status:', err);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    loading,
    error,
    refetch: checkStatus,
  };
};

// Helper hook for business hours display
export const useBusinessHoursDisplay = (businessHours: BusinessHour[]) => {
  const getHoursForDay = useCallback((dayOfWeek: string): BusinessHour | null => {
    return businessHours.find(hour => hour.day_of_week === dayOfWeek) || null;
  }, [businessHours]);

  const getFormattedHoursForDay = useCallback((dayOfWeek: string): string => {
    const hour = getHoursForDay(dayOfWeek);
    if (!hour) return 'Hours not set';
    return formatBusinessHours(hour);
  }, [getHoursForDay]);

  const hasAnyHoursSet = useCallback((): boolean => {
    return businessHours.some(hour => hour.is_open);
  }, [businessHours]);

  const getDaysWithHours = useCallback((): BusinessHour[] => {
    return businessHours.filter(hour => hour.is_open);
  }, [businessHours]);

  const getDaysWithoutHours = useCallback((): string[] => {
    const allDays = getAllDays();
    const daysWithHours = businessHours.map(hour => hour.day_of_week);
    return allDays.filter(day => !daysWithHours.includes(day));
  }, [businessHours]);

  return {
    getHoursForDay,
    getFormattedHoursForDay,
    hasAnyHoursSet,
    getDaysWithHours,
    getDaysWithoutHours,
  };
};
