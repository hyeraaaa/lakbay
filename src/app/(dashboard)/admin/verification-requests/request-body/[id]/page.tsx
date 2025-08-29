"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useVerificationRequest, type VerificationRequest } from "@/hooks/account-verification/useReviewVerification"

const getTypeBadge = (docType: VerificationRequest["doc_type"]) => {
  switch (docType) {
    case "driver_license":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Driver License
        </Badge>
      )
    case "passport":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Passport
        </Badge>
      )
    case "id_card":
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          National ID
        </Badge>
      )
    case "business_license":
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          Business License
        </Badge>
      )
    default:
      return null
  }
}

export default function RequestDetailPage() {
  const params = useParams()
  const {
    request,
    loading,
    refetch,
    approveRequest,
    rejectRequest,
    selectedImage,
    openImage,
    closeImage,
    getImageSrc,
  } = useVerificationRequest(params.id as string)

  const handleApprove = async () => {
    if (!request) return
    const success = await approveRequest(request.verification_id)
    if (success) {
      refetch()
    }
  }

  const handleReject = async () => {
    if (!request) return
    const success = await rejectRequest(request.verification_id)
    if (success) {
      refetch()
    }
  }

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
                src={getImageSrc(request.user.profile_picture) || "/placeholder.svg"}
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
          <div className="text-sm text-gray-600">
            {request.doc_urls?.length || (request.doc_url ? 1 : 0)} attachments • {getTypeBadge(request.doc_type)}
          </div>

          <div className="flex gap-4">
            {(request.doc_urls && request.doc_urls.length > 0 ? request.doc_urls : [request.doc_url])
              .filter(Boolean)
              .map((u, idx) => (
                <div
                  key={`${u}-${idx}`}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => openImage(u)}
                >
                  <div className="w-16 h-16 relative mb-2">
                    <img
                      src={getImageSrc(u) || "/placeholder.svg"}
                      alt={`Document ${idx + 1}`}
                      className="object-cover rounded w-16 h-16 scale-x-[-1]"
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
                  Reviewed on {new Date(request.reviewed_at).toLocaleDateString()} by{" "}
                  {request.reviewed_by_name || request.reviewed_by}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImage}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getImageSrc(selectedImage) || "/placeholder.svg"}
              alt="Document"
              className="max-w-full max-h-full object-contain scale-x-[-1]"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={closeImage}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
