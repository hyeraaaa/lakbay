import { apiRequest } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Map HTTP errors to friendly messages for verification flows
async function throwVerificationError(
  response: Response,
  action: 'list' | 'get' | 'status' | 'submit' | 'review',
  fallbackMsg: string
): Promise<never> {
  let friendly = fallbackMsg

  // Best-effort parse to optionally include a short validation hint (without leaking raw backend text broadly)
  let validationHints: string[] | undefined
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body: unknown = await response.json().catch(() => undefined)
      type UnknownRecord = Record<string, unknown>
      const errorsArray: unknown[] | undefined = (() => {
        if (body && typeof body === 'object' && 'errors' in (body as UnknownRecord)) {
          const candidate = (body as UnknownRecord).errors
          return Array.isArray(candidate) ? candidate : undefined
        }
        return undefined
      })()
      if (errorsArray) {
        validationHints = errorsArray
          .map((e) => {
            if (e && typeof e === 'object') {
              const rec = e as UnknownRecord
              if (typeof rec.msg === 'string') return rec.msg
              if (typeof rec.message === 'string') return rec.message
            }
            return undefined
          })
          .filter((m): m is string => typeof m === 'string')
          .slice(0, 3)
      }
    }
  } catch {
    // ignore
  }

  switch (action) {
    case 'submit':
      switch (response.status) {
        case 400:
          friendly = 'Invalid document submission. Check document type and required files.'
          break
        case 401:
          friendly = 'Your session has expired. Please sign in and try again.'
          break
        case 403:
          friendly = 'You are not allowed to submit verification for this account.'
          break
        case 404:
          friendly = 'Account not found. Please sign in and try again.'
          break
        case 409:
          friendly = 'You already have a pending or recently reviewed verification.'
          break
        case 413:
          friendly = 'Uploaded files are too large. Please upload smaller images or PDFs.'
          break
        default:
          if (response.status >= 500) friendly = 'Server error while submitting verification. Please try again later.'
      }
      break

    case 'review':
      switch (response.status) {
        case 400:
          friendly = 'Review failed. Status is invalid or request has already been reviewed.'
          break
        case 401:
          friendly = 'Your session has expired. Please sign in and try again.'
          break
        case 403:
          friendly = 'Admin privileges are required to review verification requests.'
          break
        case 404:
          friendly = 'Verification request not found.'
          break
        case 409:
          friendly = 'Review conflict. The request was updated by another admin.'
          break
        default:
          if (response.status >= 500) friendly = 'Server error while reviewing verification. Please try again later.'
      }
      break

    case 'status':
      switch (response.status) {
        case 401:
          friendly = 'Your session has expired. Please sign in and try again.'
          break
        case 404:
          friendly = 'No verification record found yet. Please submit your documents to get verified.'
          break
        default:
          if (response.status >= 500) friendly = 'Server error while fetching verification status. Please try again later.'
      }
      break

    case 'list':
    case 'get':
      switch (response.status) {
        case 401:
          friendly = 'Your session has expired. Please sign in and try again.'
          break
        case 403:
          friendly = 'You do not have permission to view verification requests.'
          break
        case 404:
          friendly = action === 'get' ? 'Verification request not found.' : 'No verification requests found.'
          break
        default:
          if (response.status >= 500) friendly = 'Server error while fetching verification data. Please try again later.'
      }
      break

    default:
      if (response.status >= 500) friendly = 'A server error occurred. Please try again later.'
  }

  if (validationHints && validationHints.length) {
    friendly += ` (${validationHints.join('; ')}${validationHints.length >= 3 ? ' …' : ''})`
  }

  throw new Error(friendly)
}

interface VerificationApiItem {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "id_card" | "business_license" | "vehicle_registration"
  doc_url: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  users_verification_user_idTousers?: {
    first_name?: string
    last_name?: string
    email?: string
    profile_picture?: string | null
  }
  users_verification_reviewed_byTousers?: {
    first_name?: string
    last_name?: string
  }
}

export interface VerificationRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "id_card" | "business_license" | "vehicle_registration" | "payout_failed" | "refund_request" | "reactivation_request"
  doc_url: string
  doc_urls?: string[]
  status: "pending" | "approved" | "rejected" | "completed" | "processing" | "failed" | "disputed"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  reviewed_by_name?: string
  notes?: string
  user?: {
    name: string
    email: string
    profile_picture?: string | null
  }
  // For action-based requests (e.g., refund), link to associated booking when available
  related_booking_id?: number
}

export const verificationService = {
  async getAll(): Promise<VerificationRequest[]> {
    const response = await apiRequest(`${API_BASE_URL}/api/verification`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      return throwVerificationError(response, 'list', 'Failed to fetch verification requests')
    }

    const data = await response.json()
    const mapped: VerificationRequest[] = (data?.verifications || []).map((v: VerificationApiItem) => {
      const userInfo = v?.users_verification_user_idTousers
      const reviewerInfo = v?.users_verification_reviewed_byTousers
      const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
      return {
        verification_id: v.verification_id,
        user_id: v.user_id,
        doc_type: v.doc_type,
        doc_url: v.doc_url,
        status: v.status,
        submitted_at: v.submitted_at,
        reviewed_at: v.reviewed_at,
        reviewed_by: v.reviewed_by,
        reviewed_by_name: reviewerInfo
          ? `${reviewerInfo.first_name || ""} ${reviewerInfo.last_name || ""}`.trim()
          : undefined,
        notes: v.notes,
        user: userInfo ? { name, email: userInfo.email || "" } : undefined,
      }
    })
    return mapped
  },

  async getById(requestId: string): Promise<VerificationRequest | null> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/verification`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        return throwVerificationError(response, 'get', 'Failed to fetch verification request')
      }

      const data = await response.json()
      const list = (data?.verifications || []) as VerificationApiItem[]
      const v = list.find((x) => String(x.verification_id) === String(requestId))

      if (!v) return null

      const userInfo = v?.users_verification_user_idTousers
      const reviewerInfo = v?.users_verification_reviewed_byTousers
      const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""

      // Parse doc_url which may be a JSON array or a single string
      let parsedDocUrls: string[] = []
      if (typeof v.doc_url === "string") {
        try {
          const maybeArray = JSON.parse(v.doc_url)
          if (Array.isArray(maybeArray)) {
            parsedDocUrls = maybeArray.filter(Boolean)
          } else if (typeof maybeArray === "string" && maybeArray.length > 0) {
            parsedDocUrls = [maybeArray]
          } else if (v.doc_url.length > 0) {
            parsedDocUrls = [v.doc_url]
          }
        } catch {
          // not JSON, treat as raw single URL
          if (v.doc_url.length > 0) parsedDocUrls = [v.doc_url]
        }
      }

      const mapped: VerificationRequest = {
        verification_id: v.verification_id,
        user_id: v.user_id,
        doc_type: v.doc_type,
        doc_url: v.doc_url,
        doc_urls: parsedDocUrls,
        status: v.status,
        submitted_at: v.submitted_at,
        reviewed_at: v.reviewed_at,
        reviewed_by: v.reviewed_by,
        reviewed_by_name: reviewerInfo
          ? `${reviewerInfo.first_name || ""} ${reviewerInfo.last_name || ""}`.trim()
          : undefined,
        notes: v.notes,
        user: userInfo ? { 
          name, 
          email: userInfo.email || "",
          profile_picture: userInfo.profile_picture || null
        } : undefined,
      }

      return mapped
    } catch (e) {
      console.error("Error fetching request:", e)
      return null
    }
  },

  async getStatus() {
    const response = await apiRequest(`${API_BASE_URL}/api/verification/status`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      return throwVerificationError(response, 'status', 'Failed to fetch verification status')
    }
    return response.json()
  },

  async submit(documentType: string, frontFile: File, backFile: File) {
    const formData = new FormData()
    formData.append("documentType", documentType)
    formData.append("documentFront", frontFile)
    formData.append("documentBack", backFile)

    const response = await apiRequest(`${API_BASE_URL}/api/verification/submit`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      return throwVerificationError(response, 'submit', 'Verification submission failed')
    }
    return response.json()
  },

  async approve(verificationId: string): Promise<boolean> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/verification/${verificationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          notes:
            "Verification request has been approved. All submitted documents meet the required standards and have been successfully verified.",
        }),
      })

      if (!response.ok) {
        await throwVerificationError(response, 'review', 'Failed to approve verification request')
      }
      return true
    } catch (error) {
      console.error("Error approving request:", error)
      return false
    }
  },

  async reject(verificationId: string): Promise<boolean> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/verification/${verificationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          notes:
            "Verification request has been rejected. The submitted documents do not meet the required standards or are incomplete. Please resubmit with valid documentation.",
        }),
      })

      if (!response.ok) {
        await throwVerificationError(response, 'review', 'Failed to reject verification request')
      }
      return true
    } catch (error) {
      console.error("Error rejecting request:", error)
      return false
    }
  },

  getImageSrc(path?: string | null): string {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    // Normalize windows backslashes to forward slashes and trim leading slashes
    const cleaned = path.replace(/\\/g, "/")
    const normalized = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned
    const base = (API_BASE_URL || "").replace(/\/+$/, "")
    return `${base}/${normalized}`
  },
}
