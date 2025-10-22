"use client"

import { useParams } from "next/navigation"
import { useVerificationRequest, type ExtendedRequest } from "@/hooks/verification-requests"
import { decodeId } from "@/lib/idCodec"
import VerificationRequestDetailSkeleton from "@/components/verification-requests/VerificationRequestDetailSkeleton"
import {
  VerificationRequestHeader,
  DocumentTypeBadge,
  DocumentGallery,
  ActionButtons,
  ReviewNotes,
  ImageModal,
} from "@/components/verification-requests"

export default function RequestDetailPage() {
  const params = useParams()
  const decodedId = decodeId(params.id as string) || (params.id as string)
  const {
    request,
    loading,
    actionLoading,
    approveRequest,
    rejectRequest,
    selectedImage,
    openImage,
    closeImage,
    getImageSrc,
  } = useVerificationRequest(decodedId)

  const handleApprove = async () => {
    if (!request) return
    await approveRequest(String(request.verification_id))
  }

  const handleReject = async () => {
    if (!request) return
    await rejectRequest(String(request.verification_id))
  }

  if (loading) {
    return <VerificationRequestDetailSkeleton />
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Verification request not found</div>
      </div>
    )
  }

  const docUrls = request.doc_urls && request.doc_urls.length > 0 
    ? request.doc_urls 
    : request.doc_url 
      ? [request.doc_url] 
      : []

  return (
    <div>
      <VerificationRequestHeader
        user={request.user}
        user_id={request.user_id}
        doc_type={request.doc_type}
        submitted_at={request.submitted_at}
        getImageSrc={getImageSrc}
      />

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {/* Only show document count for document-based requests */}
          {!["payout_failed", "refund_request", "reactivation_request"].includes(request.doc_type) && (
            <div className="text-sm text-gray-600">
              {request.doc_type === "vehicle_registration" 
                ? `${docUrls.length} vehicle registration documents` 
                : `${docUrls.length} attachments`} • 
              <DocumentTypeBadge docType={request.doc_type} />
            </div>
          )}
          
          {/* Show badge for action-based requests */}
          {["payout_failed", "refund_request", "reactivation_request"].includes(request.doc_type) && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <DocumentTypeBadge docType={request.doc_type} />
              </div>
              <div className="text-sm text-gray-500">
                {request.doc_type === "payout_failed" && "This payout failed due to a Stripe error and can be retried."}
                {request.doc_type === "refund_request" && "This refund request requires your review and decision."}
                {request.doc_type === "reactivation_request" && "This account reactivation request requires your approval."}
              </div>
            </div>
          )}

          <DocumentGallery
            docUrls={docUrls}
            docType={request.doc_type}
            getImageSrc={getImageSrc}
            onImageClick={openImage}
          />

          <ActionButtons
            status={request.status}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            requestType={request.doc_type}
          />

          <ReviewNotes
            notes={request.notes}
            reviewed_at={request.reviewed_at}
            reviewed_by_name={request.reviewed_by_name}
            reviewed_by={request.reviewed_by}
          />
        </div>
      </div>

      <ImageModal
        selectedImage={selectedImage}
        onClose={closeImage}
        getImageSrc={getImageSrc}
      />
    </div>
  )
}
