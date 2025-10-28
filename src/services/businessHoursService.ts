import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Business Hours Types
export interface BusinessHour {
  business_hour_id?: number;
  owner_id?: number;
  day_of_week: string;
  is_open: boolean;
  opening_time: string | null;
  closing_time: string | null;
  created_at?: string;
  updated_at?: string;
  owner?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    garage_location_name: string;
  };
}

export interface BusinessHoursResponse {
  success: boolean;
  data: BusinessHour[];
  message?: string;
}

export interface BusinessHourUpdateRequest {
  businessHours: BusinessHour[];
}

export interface OwnerStatusResponse {
  success: boolean;
  data: {
    is_open: boolean;
    message: string;
    current_time: string;
    current_day: string;
    opening_time?: string;
    closing_time?: string;
  };
}

export interface AllOwnersBusinessHoursResponse {
  success: boolean;
  count: number;
  data: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    garage_location_name: string;
    garage_latitude: string;
    garage_longitude: string;
    business_hours: BusinessHour[];
  }>;
}

// Business Hours Service
export const businessHoursService = {
  // Get business hours for the authenticated owner
  getOwnBusinessHours: async (): Promise<BusinessHour[]> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch business hours');
    }

    const data: BusinessHoursResponse = await response.json();
    return data.data;
  },

  // Get business hours for a specific owner (public)
  getBusinessHoursByOwnerId: async (ownerId: number): Promise<BusinessHour[]> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/${ownerId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch business hours');
    }

    const data: BusinessHoursResponse = await response.json();
    return data.data;
  },

  // Create or update business hours for the authenticated owner
  upsertBusinessHours: async (businessHours: BusinessHour[]): Promise<BusinessHour[]> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessHours }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update business hours');
    }

    const data: BusinessHoursResponse = await response.json();
    return data.data;
  },

  // Get business hours for a specific day
  getBusinessHoursForDay: async (dayOfWeek: string): Promise<BusinessHour> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/day/${dayOfWeek.toLowerCase()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch business hours for day');
    }

    const data: BusinessHoursResponse = await response.json();
    return data.data[0];
  },

  // Update business hours for a specific day
  updateBusinessHoursForDay: async (dayOfWeek: string, updateData: {
    is_open: boolean;
    opening_time?: string | null;
    closing_time?: string | null;
  }): Promise<BusinessHour> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/day/${dayOfWeek.toLowerCase()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update business hours for day');
    }

    const data: BusinessHoursResponse = await response.json();
    return data.data[0];
  },

  // Delete all business hours for the authenticated owner
  deleteBusinessHours: async (): Promise<{ message: string; count: number }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete business hours');
    }

    return response.json();
  },

  // Delete business hours for a specific day
  deleteBusinessHoursForDay: async (dayOfWeek: string): Promise<{ message: string; count: number }> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/day/${dayOfWeek.toLowerCase()}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete business hours for day');
    }

    return response.json();
  },

  // Check if owner is currently open
  checkOwnerStatus: async (ownerId: number): Promise<OwnerStatusResponse['data']> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/${ownerId}/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check owner status');
    }

    const data: OwnerStatusResponse = await response.json();
    return data.data;
  },

  // Get all owners with their business hours (public)
  getAllOwnersBusinessHours: async (): Promise<AllOwnersBusinessHoursResponse['data']> => {
    const response = await apiRequest(`${API_BASE_URL}/api/business-hours/all`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch all owners business hours');
    }

    const data: AllOwnersBusinessHoursResponse = await response.json();
    return data.data;
  },
};

// Helper functions
export const formatTime = (time: string | null): string => {
  if (!time) return 'Closed';
  
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatBusinessHours = (businessHour: BusinessHour): string => {
  if (!businessHour.is_open) {
    return 'Closed';
  }
  
  if (!businessHour.opening_time || !businessHour.closing_time) {
    return 'Hours not set';
  }
  
  return `${formatTime(businessHour.opening_time)} - ${formatTime(businessHour.closing_time)}`;
};

export const getDayDisplayName = (dayOfWeek: string): string => {
  const dayMap: { [key: string]: string } = {
    'MONDAY': 'Monday',
    'TUESDAY': 'Tuesday',
    'WEDNESDAY': 'Wednesday',
    'THURSDAY': 'Thursday',
    'FRIDAY': 'Friday',
    'SATURDAY': 'Saturday',
    'SUNDAY': 'Sunday',
  };
  
  return dayMap[dayOfWeek] || dayOfWeek;
};

export const getAllDays = (): string[] => {
  return ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
};

export const convertTo24Hour = (time12: string): string => {
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

export const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};
