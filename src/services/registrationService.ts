import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface RegistrationData {
  vehicleId: number;
  originalReceipt: File;
  certificateOfRegistration: File;
  additionalDocumentType?: string;
  additionalDocument?: File;
  additionalDocumentNumber?: string;
}

export interface RegistrationResponse {
  message: string;
  registrationId: number;
}

export interface RegistrationStatus {
  hasRegistration: boolean;
  registration: {
    id: number;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewNotes?: string;
  } | null;
  vehicle: {
    vehicle_id: number;
    brand: string;
    model: string;
    year: number;
    availability: string;
  } | null;
}

export interface AdminRegistration {
  registration_id: number;
  vehicle_id: number;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  reviewed_by?: number;
  original_receipt?: string;
  certificate_of_registration?: string;
  additional_document_type?: string;
  additional_document?: string;
  additional_document_number?: string;
  vehicle: {
    vehicle_id: number;
    brand: string;
    model: string;
    year: number;
    owner_id: number;
    users: {
      first_name: string;
      last_name: string;
      email: string;
      profile_picture?: string | null;
    };
  };
  reviewed_by_user?: {
    first_name: string;
    last_name: string;
  };
}

class RegistrationService {

  async submitRegistration(registrationData: RegistrationData): Promise<RegistrationResponse> {
    try {
      const formData = new FormData();
      formData.append('originalReceipt', registrationData.originalReceipt);
      formData.append('certificateOfRegistration', registrationData.certificateOfRegistration);
      
      if (registrationData.additionalDocumentType) {
        formData.append('additionalDocumentType', registrationData.additionalDocumentType);
      }
      
      if (registrationData.additionalDocument) {
        formData.append('additionalDocument', registrationData.additionalDocument);
      }
      
      if (registrationData.additionalDocumentNumber) {
        formData.append('additionalDocumentNumber', registrationData.additionalDocumentNumber);
      }

      const response = await apiRequest(`${API_BASE_URL}/api/registration/${registrationData.vehicleId}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit registration');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw error;
    }
  }

  async getRegistrationStatus(vehicleId: number): Promise<RegistrationStatus> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/registration/${vehicleId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch registration status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching registration status:', error);
      throw error;
    }
  }

  async getOwnerRegistrations(): Promise<Record<string, unknown>[]> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/registration/owner/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch owner registrations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching owner registrations:', error);
      throw error;
    }
  }

  async getAllRegistrations(page = 1, limit = 10, status?: string): Promise<{
    registrations: AdminRegistration[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }
      
      const response = await apiRequest(`${API_BASE_URL}/api/registration?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch all registrations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      throw error;
    }
  }

  async reviewRegistration(registrationId: number, status: string, notes: string): Promise<void> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/registration/${registrationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to review registration');
      }
    } catch (error) {
      console.error('Error reviewing registration:', error);
      throw error;
    }
  }

  async getRegistrationById(registrationId: number): Promise<AdminRegistration | null> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/registration/${registrationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch registration');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }
  }
}

export const registrationService = new RegistrationService();
