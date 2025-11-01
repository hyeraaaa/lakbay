import { apiRequest } from '@/lib/jwt'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface ReportRequest {
  category: string
  description?: string
  evidence_urls?: string[]
}

export interface ReportDetails {
  report_id: number
  reporter_id: number
  reported_entity_type: string
  reported_entity_id: number
  status: string
  priority: string
  description: string | null
  evidence_urls: string[] | null
  created_at: string
  updated_at: string
  assigned_admin_id?: number | null
  admin_notes?: string | null
  resolution_notes?: string | null
  resolved_at?: string | null
  resolved_by?: number | null
}

export interface ReportResponse {
  report: ReportDetails
  alreadyExists: boolean
}

export interface MyReportsResponse {
  reports: ReportDetails[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const reportService = {
  reportUser: async (userId: number, data: ReportRequest) => {
    const response = await apiRequest(`${API_BASE_URL}/api/reports/users/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result: ReportResponse = await response.json()
    return { ok: response.ok, data: result }
  },

  reportVehicle: async (vehicleId: number, data: ReportRequest) => {
    const response = await apiRequest(`${API_BASE_URL}/api/reports/vehicles/${vehicleId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result: ReportResponse = await response.json()
    return { ok: response.ok, data: result }
  },

  getMyReports: async (query?: { status?: string; entity_type?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (query?.status) params.append('status', query.status)
    if (query?.entity_type) params.append('entity_type', query.entity_type)
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    
    const url = `${API_BASE_URL}/api/reports/my-reports${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiRequest(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const result: MyReportsResponse = await response.json()
    return { ok: response.ok, data: result }
  },

  uploadEvidence: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await apiRequest(`${API_BASE_URL}/api/reports/upload`, {
      method: "POST",
      body: formData,
    })
    const result = await response.json()
    return { ok: response.ok, data: result }
  },

  getAdminQueue: async (filters?: { status?: string; priority?: string; entity_type?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.entity_type) params.append('entity_type', filters.entity_type)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const url = `${API_BASE_URL}/api/reports/admin/queue${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiRequest(url, {
      method: "GET",
    })
    const result = await response.json()
    return { ok: response.ok, data: result }
  },

  getAdminStatistics: async (filters?: { status?: string; priority?: string; entity_type?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.entity_type) params.append('entity_type', filters.entity_type)
    
    const url = `${API_BASE_URL}/api/reports/admin/statistics${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiRequest(url, {
      method: "GET",
    })
    const result = await response.json()
    return { ok: response.ok, data: result }
  },

  updateReportStatus: async (reportId: number, data: { status?: string; priority?: string; admin_notes?: string; resolution_notes?: string }) => {
    const response = await apiRequest(`${API_BASE_URL}/api/reports/${reportId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return { ok: response.ok, data: result }
  },

  getReportDetails: async (reportId: number) => {
    const response = await apiRequest(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: "GET",
    })
    const result = await response.json()
    return { ok: response.ok, data: result }
  },
}

