import { apiRequest } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface RefundRequest {
  refund_id: number
  booking_id: number
  user_id: number
  refund_amount: number
  refund_reason: string
  status: string
  requested_at: string
  processed_at?: string
  admin_notes?: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
  booking?: {
    booking_id: number
    vehicle_id: number
    vehicle?: {
      brand: string
      model: string
    }
  }
}

export interface RefundRequestsResponse {
  items: RefundRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const refundsDisputesService = {
  async listRefundRequests(filters: {
    page?: number
    limit?: number
    status?: string
    userId?: number
    from?: string
    to?: string
  } = {}): Promise<RefundRequestsResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value))
      }
    })

    const res = await apiRequest(`${API_BASE_URL}/api/admin/refunds?${params.toString()}`, { method: "GET" })
    const data = await res.json()
    return data as RefundRequestsResponse
  },

  async approveRefund(refundId: number, adminNotes?: string) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/refunds/${refundId}/approve`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes })
    })
    return res.json().catch(() => ({}))
  },

  async rejectRefund(refundId: number, adminNotes: string) {
    const res = await apiRequest(`${API_BASE_URL}/api/admin/refunds/${refundId}/reject`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes })
    })
    return res.json().catch(() => ({}))
  },
}

export default refundsDisputesService
