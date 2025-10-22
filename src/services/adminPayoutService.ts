import { apiRequest } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface FailedPayout {
  payout_id: number
  user_id: number
  amount: number
  failure_reason: string
  status: string
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
}

export interface FailedPayoutsResponse {
  data: FailedPayout[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const adminPayoutService = {
  async listFailedPayouts(filters: {
    page?: number
    limit?: number
    owner_id?: number
    from?: string
    to?: string
  } = {}): Promise<FailedPayoutsResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value))
      }
    })

    const res = await apiRequest(`${API_BASE_URL}/api/admin/payouts/failed?${params.toString()}`, { method: "GET" })
    const data = await res.json()
    return data as FailedPayoutsResponse
  },

  async retryPayout(bookingId: number) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/bookings/${bookingId}/payouts/retry`, { method: "POST" })
    return res.json().catch(() => ({}))
  },
}

export default adminPayoutService
