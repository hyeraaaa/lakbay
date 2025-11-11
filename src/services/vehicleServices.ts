import { apiRequest } from '@/lib/jwt';
import type { Review } from '@/services/bookingServices';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface VehicleData {
  description: string;
  plate_number: string;
  model: string;
  brand: string;
  type: 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'electric' | 'hybrid';
  year: number;
  seats: number;
  rate_per_day: number;
  transmission?: string; // backend accepts flexible strings (e.g., 'manual', 'automatic', 'cvt', 'amt', ...)
  features?: string[];
  color?: string;
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage?: number;
  insurance_info?: object;
  location?: object;
  coding?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
}

export interface VehicleResponse {
  vehicle_id: number;
  owner_id: number;
  description: string;
  plate_number: string;
  availability: string;
  model: string;
  brand: string;
  type: string;
  year: number;
  seats: number;
  rate_per_day: number;
  is_registered: boolean;
  created_at: string;
  updated_at: string;
  color?: string;
  features: string[];
  fuel_type?: string;
  transmission?: string;
  coding?: string;
  mileage?: number;
  vehicle_images?: VehicleImage[];
  // Mileage settings
  daily_mileage_limit?: number | null;
  overage_fee_per_km?: number | null;
  // Coordinates from latest owner enrollment request (flattened on response)
  garage_latitude?: number | null;
  garage_longitude?: number | null;
  garage_location_name?: string | null;
  users?: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  // Aggregated review stats present in list endpoint
  reviews_avg?: number;
  reviews_count?: number;
}

export interface VehicleImage {
  vehicle_image_id: number;
  vehicle_id: number;
  url: string;
  is_primary: boolean;
  uploaded_at: string;
  image_order: number;
}

export interface TrackingDevicePayload {
  device_imei: string;
  device_name: string;
  device_type: string;
}

export interface VehicleGPSDevice {
  device_id: number;
  device_imei: string;
  device_name: string | null;
  device_type: string | null;
  is_active: boolean;
  created_at: string;
  last_tracking?: {
    latitude: number;
    longitude: number;
    gps_timestamp: string;
    battery_level: number | null;
  } | null;
}

export interface LiveLocationData {
  latitude: number;
  longitude: number;
  lastUpdated: string;
  hasTracking: boolean;
}

class VehicleService {
  private async throwVehicleError(response: Response, action: 'create' | 'fetch' | 'fetch_list' | 'fetch_reviews' | 'update' | 'delete' | 'images', fallbackMsg: string): Promise<never> {
    // For 403 errors, try to get the specific error details from the backend
    if (response.status === 403) {
      try {
        const errorData = await response.json();
        if (errorData.code === 'STRIPE_ACCOUNT_REQUIRED') {
          throw new Error(`Stripe Connect setup required: ${errorData.message}. Please go to Settings to set up your payment account before adding vehicles.`);
        }
        if (errorData.code === 'STRIPE_ACCOUNT_DISCONNECTED') {
          throw new Error(`Stripe account disconnected: ${errorData.message}. Please reconnect your payment account in Settings before adding vehicles.`);
        }
        if (errorData.code === 'STRIPE_DISCONNECTION_PENDING') {
          throw new Error(`Stripe account disconnection pending: ${errorData.message}. Please wait for the disconnection to complete or cancel it in Settings.`);
        }
        if (errorData.code === 'STRIPE_ACCOUNT_NOT_VERIFIED') {
          throw new Error(`Stripe account verification required: ${errorData.message}. Please complete your account verification in Settings before adding vehicles.`);
        }
      } catch (parseError) {
        // If we can't parse the error, fall back to generic message
      }
    }

    // We intentionally do not surface backend messages; we only map status codes to friendly text
    let friendly = fallbackMsg;
    switch (action) {
      case 'create':
        switch (response.status) {
          case 400:
            friendly = 'Invalid vehicle details. Check plate number, transmission, and required fields.';
            break;
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 403:
            friendly = 'Identity verification is required before posting vehicles.';
            break;
          case 404:
            friendly = 'Account not found. Please sign in and try again.';
            break;
          case 409:
            friendly = 'A vehicle with the same plate number already exists.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while creating vehicle. Please try again later.';
        }
        break;
      case 'update':
        switch (response.status) {
          case 400:
            friendly = 'No valid fields to update or invalid values were provided.';
            break;
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 404:
            friendly = 'Vehicle not found or it does not belong to you.';
            break;
          case 409:
            friendly = 'Update not allowed. Vehicle is not available or there is a conflict (e.g., duplicate plate).';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while updating vehicle. Please try again later.';
        }
        break;
      case 'delete':
        switch (response.status) {
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 404:
            friendly = 'Vehicle not found or it does not belong to you.';
            break;
          case 409:
            friendly = 'Deletion not allowed. Vehicle is not available or has active bookings.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while deleting vehicle. Please try again later.';
        }
        break;
      case 'images':
        switch (response.status) {
          case 400:
            friendly = 'Invalid images or request. Please check file types and sizes.';
            break;
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 404:
            friendly = 'Vehicle not found or you do not have access to it.';
            break;
          case 413:
            friendly = 'Images are too large. Please upload smaller files.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while uploading images. Please try again later.';
        }
        break;
      case 'fetch':
        switch (response.status) {
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 404:
            friendly = 'Vehicle not found.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while fetching vehicle. Please try again later.';
        }
        break;
      case 'fetch_list':
        switch (response.status) {
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while fetching vehicles. Please try again later.';
        }
        break;
      case 'fetch_reviews':
        switch (response.status) {
          case 401:
            friendly = 'Your session has expired. Please sign in and try again.';
            break;
          case 404:
            friendly = 'Vehicle not found. Reviews are unavailable.';
            break;
          default:
            if (response.status >= 500) friendly = 'Server error while fetching reviews. Please try again later.';
        }
        break;
      default:
        if (response.status >= 500) friendly = 'A server error occurred. Please try again later.';
    }

    throw new Error(friendly);
  }
  private async throwTrackingError(response: Response, fallbackMsg: string): Promise<never> {
    const contentType = response.headers.get('content-type') || '';
    let body: unknown = undefined;
    try {
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        const text = await response.text();
        try { body = JSON.parse(text); } catch { /* ignore non-JSON */ }
      }
    } catch {
      // ignore parse errors
    }

    type UnknownRecord = Record<string, unknown>;
    const errorsArray: unknown[] | undefined = (() => {
      if (body && typeof body === 'object' && 'errors' in (body as UnknownRecord)) {
        const candidate = (body as UnknownRecord).errors;
        return Array.isArray(candidate) ? candidate : undefined;
      }
      return undefined;
    })();

    const validationErrors: string[] | undefined = errorsArray
      ?.map((e) => {
        if (e && typeof e === 'object') {
          const rec = e as UnknownRecord;
          if (typeof rec.msg === 'string') return rec.msg;
          if (typeof rec.message === 'string') return rec.message;
        }
        return undefined;
      })
      .filter((m): m is string => typeof m === 'string');

    let friendly = '';
    switch (response.status) {
      case 400:
        friendly = 'Invalid device details. Please check the IMEI and name.';
        if (validationErrors && validationErrors.length) {
          const details = validationErrors.slice(0, 3).join('; ');
          friendly += ` (${details}${validationErrors.length > 3 ? ' …' : ''})`;
        }
        break;
      case 401:
        friendly = 'Your session has expired. Please sign in and try again.';
        break;
      case 403:
        friendly = 'You do not have permission to perform this action.';
        break;
      case 404:
        friendly = 'Vehicle not found or you do not have access to it.';
        break;
      case 409:
        friendly = 'A GPS device with this IMEI is already registered.';
        break;
      default:
        if (response.status >= 500) {
          friendly = 'Server error while processing request. Please try again later.';
        } else {
          friendly = fallbackMsg;
        }
    }

    throw new Error(friendly);
  }
  private async parseAndThrow(response: Response, fallbackMsg: string): Promise<never> {
    let message = fallbackMsg;
    try {
      const text = await response.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          message = json.message || json.error || text;
        } catch {
          message = text;
        }
      }
    } catch {}
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  async createVehicle(vehicleData: VehicleData): Promise<VehicleResponse> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'create', 'Failed to create vehicle');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async getMyVehicles(params?: Record<string, string | number | boolean | undefined>): Promise<VehicleResponse[]> {
    try {
      const query = params
        ? Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim?.() !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&')
        : ''
      const url = `${API_BASE_URL}/api/vehicles/owner/my-vehicles${query ? `?${query}` : ''}`
      const response = await apiRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'fetch_list', 'Failed to fetch vehicles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async getAllVehicles(params?: Record<string, string | number | undefined>): Promise<VehicleResponse[]> {
    try {
      const query = params
        ? Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim() !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&')
        : '';
      const url = `${API_BASE_URL}/api/vehicles${query ? `?${query}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vehicles');
      }

      const data = await response.json();
      // The API returns { vehicles: VehicleResponse[], pagination: {...} }
      // We need to extract the vehicles array
      return data.vehicles || data;
    } catch (error) {
      console.error('Error fetching all vehicles:', error);
      throw error;
    }
  }

  async getVehicleById(vehicleId: number): Promise<VehicleResponse> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'fetch', 'Failed to fetch vehicle');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle by id:', error);
      throw error;
    }
  }

  async uploadVehicleImages(vehicleId: number, images: File[]): Promise<VehicleImage[]> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'images', 'Failed to upload images');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading vehicle images:', error);
      throw error;
    }
  }

  async deleteVehicleImage(imageId: number): Promise<void> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicle-images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'images', 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting vehicle image:', error);
      throw error;
    }
  }

  async updateVehicle(vehicleId: number, vehicleData: Partial<VehicleData>): Promise<VehicleResponse> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'update', 'Failed to update vehicle');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async deleteVehicle(vehicleId: number): Promise<void> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'delete', 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  async addTrackingDevice(vehicleId: number, payload: TrackingDevicePayload): Promise<{ message: string }> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/tracking/vehicles/${vehicleId}/gps-devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return this.throwTrackingError(response, 'Failed to add tracking device.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding tracking device:', error);
      throw error;
    }
  }

  async getVehicleGPSDevices(vehicleId: number): Promise<VehicleGPSDevice[]> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/tracking/vehicles/${vehicleId}/gps-devices`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        return this.throwTrackingError(response, 'Failed to fetch vehicle GPS devices.');
      }
      const data = await response.json();
      // API returns { success, data: { gps_devices: [...] } }
      return data?.data?.gps_devices ?? [];
    } catch (error) {
      console.error('Error fetching vehicle GPS devices:', error);
      throw error;
    }
  }

  async updateTrackingDevice(deviceId: number, payload: { device_name?: string; is_active?: boolean }): Promise<{ message: string }> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/tracking/gps-devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return this.throwTrackingError(response, 'Failed to update tracking device.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating tracking device:', error);
      throw error;
    }
  }

  async getVehicleReviews(vehicleId: number, params?: { rating?: number | null }): Promise<VehicleReview[]> {
    try {
      const query = params && typeof params.rating !== 'undefined' && params.rating !== null
        ? `?rating=${encodeURIComponent(String(params.rating))}`
        : '';
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}/reviews${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'fetch_reviews', 'Failed to fetch vehicle reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle reviews:', error);
      throw error;
    }
  }

  async getVehicleLastLocation(vehicleId: number): Promise<LiveLocationData | null> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/tracking/vehicles/${vehicleId}/location`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // Don't throw error for 404 or other status codes - just return null
        return null;
      }

      const data = await response.json();
      const locationData = data?.data?.location;
      
      if (!locationData || !locationData.latitude || !locationData.longitude) {
        return null;
      }

      return {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        lastUpdated: locationData.last_updated,
        hasTracking: data?.data?.has_tracking || false
      };
    } catch (error) {
      console.error('Error fetching vehicle last location:', error);
      return null;
    }
  }

  async updateVehicleMileageSettings(vehicleId: number, mileageSettings: { daily_mileage_limit?: number | null; overage_fee_per_km?: number | null }): Promise<VehicleResponse> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}/mileage-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mileageSettings),
      });

      if (!response.ok) {
        return this.throwVehicleError(response, 'update', 'Failed to update mileage settings');
      }

      const data = await response.json();
      return data.vehicle;
    } catch (error) {
      console.error('Error updating vehicle mileage settings:', error);
      throw error;
    }
  }

  async updateVehicleAvailability(vehicleId: number, availability: string, reason?: string): Promise<VehicleResponse> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/vehicles/${vehicleId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability, reason }),
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Cannot change availability. Vehicle may have active bookings or is not registered.');
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid availability status. Owners can only toggle between available and maintenance.');
        }
        return this.throwVehicleError(response, 'update', 'Failed to update vehicle availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      throw error;
    }
  }
}

export const vehicleService = new VehicleService();

export type VehicleReview = Review & {
  users?: {
    user_id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string | null;
  };
};
