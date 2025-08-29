"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"
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

const getTypeBadge = (docType: VerificationRequest["doc_type"]) => {
  switch (docType) {
    case "driver_license":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Driver License</Badge>
    case "passport":
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Passport</Badge>
    case "id_card":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700">National ID</Badge>
    case "business_license":
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Business License</Badge>
    default:
      return null
  }
}

export default function RequestDetailPage() {
  const params = useParams()
  const [request, setRequest] = useState<VerificationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    if (params.id) {
      fetchRequest(params.id as string)
    }
  }, [params.id])

  const getImageSrc = (path?: string | null) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    const normalized = path.startsWith('/') ? path.slice(1) : path
    return `${API_BASE_URL}/${normalized}`
  }

  const fetchRequest = async (id: string) => {
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
      const v = list.find((x) => String(x.verification_id) === String(id))
      if (!v) {
        setRequest(null)
      } else {
        const userInfo = v?.users_verification_user_idTousers
        const reviewerInfo = v?.users_verification_reviewed_byTousers
        const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
        // Parse doc_url which may be a JSON array or a single string
        let parsedDocUrls: string[] = []
        if (typeof v.doc_url === 'string') {
          try {
            const maybeArray = JSON.parse(v.doc_url)
            if (Array.isArray(maybeArray)) {
              parsedDocUrls = maybeArray.filter(Boolean)
            } else if (typeof maybeArray === 'string' && maybeArray.length > 0) {
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
          reviewed_by_name: reviewerInfo ? `${reviewerInfo.first_name || ""} ${reviewerInfo.last_name || ""}`.trim() : undefined,
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

  const handleApprove = async () => {
    if (!request) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/${request.verification_id}/review`, {
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
      });
  
      if (response.ok) {
        // Refresh the request to reflect latest server state
        await fetchRequest(request.verification_id as string)
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };
  
  const handleReject = async () => {
    if (!request) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/verification/${request.verification_id}/review`, {
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
      });
  
      if (response.ok) {
        await fetchRequest(request.verification_id as string)
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading verification request...</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Verification request not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/verification-requests">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {request.user?.profile_picture ? (
              <img
                src={getImageSrc(request.user.profile_picture)}
                alt={request.user?.name || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {request.user?.name?.charAt(0) || request.user_id.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base font-medium text-gray-900">{request.user?.name || `User ${request.user_id}`}</h1>
              <p className="text-sm text-gray-500">Verification Request</p>
            </div>
            <div className="ml-auto text-sm text-gray-500">{new Date(request.submitted_at).toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-4">
          <div className="text-sm text-gray-600">{(request.doc_urls?.length || (request.doc_url ? 1 : 0))} attachments • {getTypeBadge(request.doc_type)}</div>

          <div className="flex gap-4">
            {(request.doc_urls && request.doc_urls.length > 0 ? request.doc_urls : [request.doc_url]).filter(Boolean).map((u, idx) => (
              <div
                key={`${u}-${idx}`}
                className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedImage(u)}
              >
                <div className="w-16 h-16 relative mb-2">
                  <img
                    src={getImageSrc(u)}
                    alt={`Document ${idx + 1}`}
                    className="object-cover rounded w-16 h-16"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <div className="font-medium">{`document_${idx + 1}.jpg`}</div>
                  <div></div>
                </div>
              </div>
            ))}
          </div>

          {request.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 rounded-full px-6 bg-transparent"
              >
                <XCircle className="h-4 w-4 mr-2" />  
                Reject
              </Button>
            </div>
          )}

          {request.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Review Notes</h3>
              <p className="text-sm text-gray-700">{request.notes}</p>
              {request.reviewed_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Reviewed on {new Date(request.reviewed_at).toLocaleDateString()} by {request.reviewed_by_name || request.reviewed_by}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getImageSrc(selectedImage)}
              alt="Document"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
