import { apiRequest } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export type AdminUserListFilters = {
  userType?: string
  accountStatus?: string
  isActive?: boolean
  isVerified?: boolean
  search?: string
  createdAfter?: string
  createdBefore?: string
  page?: number
  limit?: number
}

export type AdminUserSummary = {
  user_id: number
  first_name: string
  last_name: string
  username: string | null
  email: string
  phone: string | null
  user_type: string
  account_status: string
  is_active: boolean
  is_verified: boolean
  is_email_verified: boolean
  is_phone_verified: boolean
  created_at: string
  updated_at: string
  _count?: {
    booking?: number
    vehicle?: number
    reviews?: number
  }
}

export type AdminUserListResponse = {
  users: AdminUserSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const adminUserService = {
  async listUsers(filters: AdminUserListFilters = {}): Promise<AdminUserListResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value))
      }
    })

    const res = await apiRequest(`${API_BASE_URL}/api/admin/users?${params.toString()}`, { method: "GET" })
    const data = await res.json()
    return data as AdminUserListResponse
  },

  async activateUser(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/activate`, { method: "POST" })
    return res.json().catch(() => ({}))
  },

  async deactivateUser(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, { method: "POST" })
    return res.json().catch(() => ({}))
  },

  async banUser(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/ban`, { method: "POST" })
    return res.json().catch(() => ({}))
  },
}

export default adminUserService


