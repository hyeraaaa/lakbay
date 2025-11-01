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

export type AdminRegistrationData = {
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string
  address_line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
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

export type AdminUserGlobalCounts = {
  total: number
  active: number
  deactivated: number
  banned: number
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

  async getGlobalUserCounts(): Promise<AdminUserGlobalCounts> {
    // Use the list endpoint to fetch totals per status using minimal payload
    const [all, active, deactivated, banned] = await Promise.all([
      this.listUsers({ page: 1, limit: 1 }),
      this.listUsers({ page: 1, limit: 1, accountStatus: 'active' }),
      this.listUsers({ page: 1, limit: 1, accountStatus: 'deactivated' }),
      this.listUsers({ page: 1, limit: 1, accountStatus: 'banned' }),
    ])

    return {
      total: all.pagination.total,
      active: active.pagination.total,
      deactivated: deactivated.pagination.total,
      banned: banned.pagination.total,
    }
  },

  async getFilteredUserCounts(filters: Omit<AdminUserListFilters, 'page' | 'limit' | 'accountStatus'>): Promise<AdminUserGlobalCounts> {
    // Use the list endpoint to fetch totals per status using minimal payload with filters applied
    const [all, active, deactivated, banned] = await Promise.all([
      this.listUsers({ ...filters, page: 1, limit: 1 }),
      this.listUsers({ ...filters, page: 1, limit: 1, accountStatus: 'active' }),
      this.listUsers({ ...filters, page: 1, limit: 1, accountStatus: 'deactivated' }),
      this.listUsers({ ...filters, page: 1, limit: 1, accountStatus: 'banned' }),
    ])

    return {
      total: all.pagination.total,
      active: active.pagination.total,
      deactivated: deactivated.pagination.total,
      banned: banned.pagination.total,
    }
  },

  async activateUser(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/activate`, { method: "POST" })
    return res.json().catch(() => ({}))
  },

  async deactivateUser(userId: number, reason?: string) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || "Admin deactivation" })
    })
    return res.json().catch(() => ({}))
  },

  async banUser(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/ban`, { method: "POST" })
    return res.json().catch(() => ({}))
  },

  async approveReactivation(userId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/reactivation/approve`, { method: "POST" })
    return res.json().catch(() => ({}))
  },

  async rejectReactivation(userId: number, notes: string) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/reactivation/reject`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    })
    return res.json().catch(() => ({}))
  },

  async registerAdmin(adminData: AdminRegistrationData) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/users/register-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData)
    })
    return res.json().catch(() => ({}))
  },
}

export default adminUserService


