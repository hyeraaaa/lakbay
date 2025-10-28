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

    const res = await apiRequest(`${API_BASE_URL}/api/refunds-disputes/refunds?${params.toString()}`, { method: "GET" })
    const data = await res.json()
    return data as RefundRequestsResponse
  },

  async approveRefund(
    refundId: number,
    adminNotes: string = "Refund approved",
    options?: { refundAmount?: number; refundPercentage?: number }
  ) {
    // Backend implements approval as processing a refund. It requires either
    // refundAmount or refundPercentage and adminNotes.
    const payload: Record<string, unknown> = {
      adminNotes,
    }

    if (options?.refundAmount !== undefined && options?.refundPercentage !== undefined) {
      // Prefer explicit amount when both are provided to avoid backend 400
      payload.refundAmount = options.refundAmount
    } else if (options?.refundAmount !== undefined) {
      payload.refundAmount = options.refundAmount
    } else if (options?.refundPercentage !== undefined) {
      payload.refundPercentage = options.refundPercentage
    } else {
      // Default to 100% refund if not specified
      payload.refundPercentage = 100
    }

    const res = await apiRequest(`${API_BASE_URL}/api/refunds-disputes/refunds/${refundId}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return res.json().catch(() => ({}))
  },

  async rejectRefund(refundId: number, adminNotes: string) {
    const res = await apiRequest(`${API_BASE_URL}/api/refunds-disputes/refunds/${refundId}/reject`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes })
    })
    return res.json().catch(() => ({}))
  },
}

export default refundsDisputesService

