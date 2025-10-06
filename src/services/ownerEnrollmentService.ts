import { apiRequest } from "@/lib/jwt"
import type { VerificationRequest } from "./verificationServices"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface OwnerEnrollmentItem {
  request_id: number
  user_id: number
  permit_url: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: number
  notes?: string
  user?: {
    first_name?: string
    last_name?: string
    email?: string
    profile_picture?: string | null
  }
  reviewer?: {
    first_name?: string
    last_name?: string
  }
}

export interface OwnerEnrollmentListResponse {
  items: OwnerEnrollmentItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const ownerEnrollmentService = {
  async getAll(): Promise<VerificationRequest[]> {
    const response = await apiRequest(`${API_BASE_URL}/api/owner-enrollments/admin`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to fetch owner enrollment requests")
    }

    const data: OwnerEnrollmentListResponse = await response.json()
    const items = Array.isArray(data?.items) ? data.items : []

    const mapped: VerificationRequest[] = items.map((it: OwnerEnrollmentItem) => {
      const userInfo = it?.user
      const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
      return {
        verification_id: String(it.request_id),
        user_id: String(it.user_id),
        doc_type: "business_license",
        doc_url: it.permit_url,
        status: it.status,
        submitted_at: it.submitted_at,
        reviewed_at: it.reviewed_at,
        reviewed_by: it.reviewed_by ? String(it.reviewed_by) : undefined,
        reviewed_by_name: it.reviewer ? 
          `${it.reviewer.first_name || ""} ${it.reviewer.last_name || ""}`.trim() : undefined,
        notes: it.notes,
        user: userInfo ? { name, email: userInfo.email || "" } : undefined,
      }
    })

    return mapped
  },
  async getById(requestId: string): Promise<VerificationRequest | null> {
    const response = await apiRequest(`${API_BASE_URL}/api/owner-enrollments/admin`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) return null
    const data: OwnerEnrollmentListResponse = await response.json()
    const items = Array.isArray(data?.items) ? data.items : []
    const it = items.find((x: OwnerEnrollmentItem) => String(x.request_id) === String(requestId))
    if (!it) return null
    const userInfo = it?.user
    const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
    const mapped: VerificationRequest = {
      verification_id: String(it.request_id),
      user_id: String(it.user_id),
      doc_type: "business_license",
      doc_url: it.permit_url,
      status: it.status,
      submitted_at: it.submitted_at,
      reviewed_at: it.reviewed_at,
      reviewed_by: it.reviewed_by ? String(it.reviewed_by) : undefined,
      reviewed_by_name: it.reviewer ? 
        `${it.reviewer.first_name || ""} ${it.reviewer.last_name || ""}`.trim() : undefined,
      notes: it.notes,
      user: userInfo ? { 
        name, 
        email: userInfo.email || "",
        profile_picture: userInfo.profile_picture || null
      } : undefined,
    }
    // If reviewed_by exists, fetch admin user to get a display name
    if (it.reviewed_by) {
      try {
        const adminRes = await apiRequest(`${API_BASE_URL}/api/users/${it.reviewed_by}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (adminRes.ok) {
          const admin = await adminRes.json()
          const adminName = `${admin?.first_name || ""} ${admin?.last_name || ""}`.trim()
          if (adminName) mapped.reviewed_by_name = adminName
        }
      } catch {}
    }
    return mapped
  },
  async approve(requestId: string): Promise<boolean> {
    const response = await apiRequest(`${API_BASE_URL}/api/owner-enrollments/admin/${requestId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes:
          "Owner enrollment approved. Business permit validated and meets all requirements. Welcome aboard!",
      }),
    })
    return response.ok
  },
  async reject(requestId: string): Promise<boolean> {
    const response = await apiRequest(`${API_BASE_URL}/api/owner-enrollments/admin/${requestId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes:
          "Owner enrollment rejected. The submitted business permit is incomplete or unclear. Please upload a clear, valid permit and resubmit.",
      }),
    })
    return response.ok
  },
}


