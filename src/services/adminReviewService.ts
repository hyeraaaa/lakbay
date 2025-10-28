import { apiRequest } from "@/lib/jwt"
import type { VerificationRequest } from "./verificationServices"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Raw data types from API
interface RawUser {
  user_id?: string | number
  first_name?: string
  last_name?: string
  email?: string
  profile_picture?: string | null
}

interface RawVehicle {
  brand?: string
  model?: string
  year?: number
  owner_id?: string | number
  users?: RawUser
}

interface RawReviewItem {
  itemType?: string
  registration_id?: string | number
  verification_id?: string | number
  request_id?: string | number
  id?: string | number
  user_id?: string | number
  owner_id?: string | number
  status?: string
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string | number
  notes?: string
  review_notes?: string
  doc_type?: string
  doc_url?: string
  doc_urls?: unknown
  permit_url?: string
  original_receipt?: string
  certificate_of_registration?: string
  additional_document?: string
  vehicle?: RawVehicle
  user?: RawUser
  users_verification_user_idTousers?: RawUser
  users_verification_reviewed_byTousers?: RawUser
  reviewed_by_user?: RawUser
  reviewer?: RawUser
  created_at?: string
  // Additional fields for payout_failed requests
  payout_id?: string | number
  amount?: number
  failure_reason?: string
  error_message?: string
  updated_at?: string
  owner_user?: RawUser
  booking?: {
    users?: RawUser
  }
  // Additional fields for refund requests
  refund_id?: string | number
  booking_id?: string | number
  refund_amount?: number
  refund_reason?: string
  requested_at?: string
  requested_by?: string | number
  requested_by_user?: RawUser
  processed_by?: string | number
  processed_by_user?: RawUser
  processed_at?: string
  admin_notes?: string
  // Additional fields for reactivation requests
  reactivation_id?: string | number
  deactivation_reason?: string
  reactivation_reason?: string
  decided_by?: string | number
  decided_by_admin?: RawUser
  decided_at?: string
}

// Unified review item coming from the backend. We normalize it to VerificationRequest-compatible shape.
export type AdminReviewItem = VerificationRequest & {
  vehicle?: {
    brand: string
    model: string
    year: number
  }
  isRegistration?: boolean
}

function normalizeDocUrls(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === "string") {
    try {
      const maybe = JSON.parse(raw)
      if (Array.isArray(maybe)) return maybe.filter(Boolean)
      if (typeof maybe === "string" && maybe.length > 0) return [maybe]
      if (raw.length > 0) return [raw]
    } catch {
      if (raw.length > 0) return [raw]
    }
  }
  return undefined
}

function mapItem(it: RawReviewItem): AdminReviewItem {
  // Handle different data structures based on itemType
  const itemType = it.itemType
  
  let userInfo: RawUser | undefined, reviewerInfo: RawUser | undefined, docType: string, docUrl: string, docUrls: string[] | undefined, vehicleInfo: RawVehicle | undefined, verificationId: string, userId: string, status: string, submittedAt: string, reviewedAt: string | undefined, reviewedBy: string | undefined, notes: string | undefined

  if (itemType === 'registration') {
    // Vehicle registration data structure
    userInfo = it.vehicle?.users
    reviewerInfo = it.reviewed_by_user
    docType = "vehicle_registration"
    docUrl = it.original_receipt || ""
    docUrls = [it.original_receipt, it.certificate_of_registration, it.additional_document].filter(Boolean) as string[]
    vehicleInfo = it.vehicle
    verificationId = `reg_${it.registration_id || ''}`
    userId = String(it.vehicle?.owner_id || it.vehicle?.users?.user_id || '')
    status = it.status || 'pending'
    submittedAt = it.submitted_at || new Date().toISOString()
    reviewedAt = it.reviewed_at
    reviewedBy = it.reviewed_by ? String(it.reviewed_by) : undefined
    notes = it.review_notes
  } else if (itemType === 'verification') {
    // Account verification data structure
    userInfo = it.users_verification_user_idTousers
    reviewerInfo = it.users_verification_reviewed_byTousers
    docType = it.doc_type || 'id_card'
    docUrl = it.doc_url || ''
    docUrls = normalizeDocUrls(it.doc_urls ?? it.doc_url)
    verificationId = `ver_${it.verification_id || ''}`
    userId = String(it.user_id || '')
    status = it.status || 'pending'
    submittedAt = it.submitted_at || new Date().toISOString()
    reviewedAt = it.reviewed_at
    reviewedBy = it.reviewed_by ? String(it.reviewed_by) : undefined
    notes = it.notes
  } else if (itemType === 'owner_enrollment') {
    // Business permit/host enrollment data structure
    userInfo = it.user
    reviewerInfo = it.reviewer
    docType = "business_license"
    docUrl = it.permit_url || ''
    docUrls = [it.permit_url].filter(Boolean) as string[]
    verificationId = `owner_${it.request_id || ''}`
    userId = String(it.user_id || '')
    status = it.status || 'pending'
    submittedAt = it.submitted_at || new Date().toISOString()
    reviewedAt = it.reviewed_at
    reviewedBy = it.reviewed_by ? String(it.reviewed_by) : undefined
    notes = it.notes
  } else if (itemType === 'payout_failed') {
    // Failed payout data structure - system event, no user submission
    userInfo = undefined // No user data needed for system payout failures
    reviewerInfo = undefined // No reviewer for system events
    docType = "payout_failed"
    docUrl = ''
    docUrls = []
    // Use booking_id so client can call payout retry endpoint that expects bookingId
    verificationId = `payout_${it.booking_id || it.payout_id || it.id || ''}`
    userId = String(it.owner_id || '') // Use owner_id for reference
    status = 'pending' // Always pending for retry
    submittedAt = it.updated_at || new Date().toISOString()
    reviewedAt = undefined
    reviewedBy = undefined
    notes = it.error_message || it.failure_reason || 'Stripe payout failed - ready for retry'
  } else if (itemType === 'refund') {
    // Refund request data structure
    userInfo = it.requested_by_user || it.user
    reviewerInfo = it.processed_by_user || it.reviewer
    docType = "refund_request"
    docUrl = ''
    docUrls = []
    verificationId = `refund_${it.refund_id || it.id || ''}`
    userId = String(it.user_id || it.requested_by || '')
    status = it.status || 'pending'
    submittedAt = it.submitted_at || it.requested_at || it.created_at || new Date().toISOString()
    reviewedAt = it.reviewed_at || it.processed_at
    reviewedBy = it.reviewed_by || it.processed_by ? String(it.reviewed_by || it.processed_by) : undefined
    notes = it.refund_reason || it.admin_notes || it.notes
  } else if (itemType === 'reactivation_request') {
    // Account reactivation data structure
    userInfo = it.user
    reviewerInfo = it.decided_by_admin || it.reviewer
    docType = "reactivation_request"
    docUrl = ''
    docUrls = []
    verificationId = `reactivation_${it.reactivation_id || it.request_id || it.id || ''}`
    userId = String(it.user_id || '')
    status = it.status || 'pending'
    submittedAt = it.submitted_at || it.requested_at || it.created_at || new Date().toISOString()
    reviewedAt = it.reviewed_at || it.decided_at
    reviewedBy = it.reviewed_by || it.decided_by ? String(it.reviewed_by || it.decided_by) : undefined
    notes = it.reactivation_reason || it.notes
  } else {
    // Fallback for unknown structure
    userInfo = it.user || it.users_verification_user_idTousers
    reviewerInfo = it.reviewed_by_user || it.reviewer || it.users_verification_reviewed_byTousers
    docType = it.doc_type || "id_card"
    docUrl = it.doc_url || it.permit_url || ""
    docUrls = normalizeDocUrls(it.doc_urls ?? it.doc_url ?? it.permit_url)
    verificationId = String(it.verification_id ?? it.request_id ?? it.registration_id ?? it.id ?? '')
    userId = String(it.user_id ?? it.owner_id ?? userInfo?.user_id ?? "")
    status = it.status || "pending"
    submittedAt = it.submitted_at || it.created_at || new Date().toISOString()
    reviewedAt = it.reviewed_at
    reviewedBy = it.reviewed_by ? String(it.reviewed_by) : undefined
    notes = it.notes ?? it.review_notes
    vehicleInfo = it.vehicle
  }

  const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
  const reviewerName = reviewerInfo ? `${reviewerInfo.first_name || ""} ${reviewerInfo.last_name || ""}`.trim() : undefined

  const base: AdminReviewItem = {
    verification_id: verificationId,
    user_id: String(userId),
    doc_type: docType as AdminReviewItem["doc_type"],
    doc_url: docUrl,
    doc_urls: docUrls,
    status: status as AdminReviewItem["status"],
    submitted_at: submittedAt,
    reviewed_at: reviewedAt,
    reviewed_by: reviewedBy ? String(reviewedBy) : undefined,
    reviewed_by_name: reviewerName,
    notes: notes,
    user: userInfo
      ? {
          name,
          email: userInfo.email || '',
          profile_picture: userInfo.profile_picture || null,
        }
      : undefined,
  }

  // Attach related booking id for action-based items when available
  if (itemType === 'refund' && it.booking_id) {
    ;(base as unknown as { related_booking_id?: number }).related_booking_id = Number(it.booking_id)
  }

  if (vehicleInfo) {
    base.vehicle = {
      brand: vehicleInfo.brand || '',
      model: vehicleInfo.model || '',
      year: vehicleInfo.year || 0,
    }
    base.isRegistration = true
  }

  return base
}

// Pagination interface
export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminReviewService = {
  async getAll(page?: number, limit?: number, status?: string): Promise<{ items: AdminReviewItem[], pagination?: PaginationData }> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', String(page))
    if (limit !== undefined) params.append('limit', String(limit))
    if (status && status !== 'all') params.append('status', status)
    
    const url = `${API_BASE_URL}/api/admin/reviews${params.toString() ? `?${params.toString()}` : ''}`
    
    console.log('🌐 API call:', url)
    
    const response = await apiRequest(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to fetch admin reviews")
    }
    const data = await response.json().catch(() => ({} as { items?: RawReviewItem[]; reviews?: RawReviewItem[]; pagination?: PaginationData }))
    
    // Debug logging to see what we're getting
    console.log("Admin reviews response:", data)
    
    const list: RawReviewItem[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : Array.isArray(data?.reviews) ? data.reviews : []
    
    // Debug logging to see the mapped items
    const mapped = list.map(mapItem)
    console.log("Mapped admin review items:", mapped)
    
    return {
      items: mapped,
      pagination: data.pagination
    }
  },

  async getById(id: string): Promise<AdminReviewItem | null> {
    // If a dedicated endpoint exists, prefer it. Fallback to list and filter.
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/admin/reviews/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const one = await response.json().catch(() => null)
        if (!one) return null
        return mapItem(one as RawReviewItem)
      }
    } catch {}

    try {
      const all = await this.getAll()
      return all.items.find((x) => String(x.verification_id) === String(id)) || null
    } catch (e) {
      return null
    }
  },
}

export type { VerificationRequest }


