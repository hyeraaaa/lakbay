"use client"

import { useState, useEffect } from "react"
import { getAccessToken } from "@/lib/jwt"

interface VerificationRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "id_card" | "business_license"
  doc_url: string
  doc_urls?: string[]
  status: "pending" | "approved" | "rejected"
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
}

export function useVerificationRequest(id: string | undefined) {
  const [request, setRequest] = useState<VerificationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  const fetchRequest = async (requestId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/verification`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      const list = (data?.verifications || []) as any[]
      const v = list.find((x) => String(x.verification_id) === String(requestId))

      if (!v) {
        setRequest(null)
      } else {
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
          user: userInfo ? { name, email: userInfo.email } : undefined,
        }

        // Try to fetch profile to get profile_picture
        try {
          const profileRes = await fetch(`${API_BASE_URL}/api/users/${v.user_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
            },
          })
          if (profileRes.ok) {
            const profile = await profileRes.json()
            mapped.user = {
              ...(mapped.user || { name: name, email: userInfo?.email }),
              profile_picture: profile?.profile_picture || null,
            }
          }
        } catch {}

        setRequest(mapped)
      }
    } catch (e) {
      console.error("Error fetching request:", e)
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (verificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/${verificationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
        body: JSON.stringify({
          status: "approved",
          notes:
            "Verification request has been approved. All submitted documents meet the required standards and have been successfully verified.",
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error approving request:", error)
      return false
    }
  }

  const rejectRequest = async (verificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/${verificationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
        body: JSON.stringify({
          status: "rejected",
          notes:
            "Verification request has been rejected. The submitted documents do not meet the required standards or are incomplete. Please resubmit with valid documentation.",
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error rejecting request:", error)
      return false
    }
  }

  const openImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeImage = () => {
    setSelectedImage(null)
  }

  const getImageSrc = (path?: string | null) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    const normalized = path.startsWith("/") ? path.slice(1) : path
    return `${API_BASE_URL}/${normalized}`
  }

  useEffect(() => {
    if (id) {
      fetchRequest(id)
    }
  }, [id])

  return {
    // Data and loading state
    request,
    loading,
    refetch: () => id && fetchRequest(id),
    // Action functions
    approveRequest,
    rejectRequest,
    // Image modal state and functions
    selectedImage,
    openImage,
    closeImage,
    // Utility functions
    getImageSrc,
  }
}

export type { VerificationRequest }
