"use client"

import Image from "next/image"

interface DocumentGalleryProps {
  docUrls: (string | null)[]
  docType: string
  getImageSrc: (path?: string | null) => string | null
  onImageClick: (url: string) => void
}

export default function DocumentGallery({
  docUrls,
  docType,
  getImageSrc,
  onImageClick,
}: DocumentGalleryProps) {
  const getDocumentName = (idx: number) => {
    if (docType === "vehicle_registration") {
      if (idx === 0) return "Original Receipt"
      else if (idx === 1) return "Certificate of Registration"
      else if (idx === 2) return "Additional Document"
      else return `Document ${idx + 1}`
    } else if (docType === "business_license") {
      if (idx === 0) return "Business Permit"
      else if (idx === 1) return "Insurance Policy"
      else if (idx === 2) return "Additional Business Document"
      else return `Business Document ${idx + 1}`
    } else if (docType === "driver_license") {
      if (idx === 0) return "Driver's License (Front)"
      else if (idx === 1) return "Driver's License (Back)"
      else return `Additional Document ${idx + 1}`
    } else if (docType === "passport") {
      if (idx === 0) return "Passport (Front)"
      else if (idx === 1) return "Passport (Back)"
      else return `Additional Document ${idx + 1}`
    } else if (docType === "id_card") {
      if (idx === 0) return "National ID (Front)"
      else if (idx === 1) return "National ID (Back)"
      else return `Additional Document ${idx + 1}`
    } else {
      if (idx === 0) return "Primary Document"
      else if (idx === 1) return "Secondary Document"
      else return `Document ${idx + 1}`
    }
  }

  const getNoDocumentsMessage = () => {
    switch (docType) {
      case "vehicle_registration":
        return "No documents uploaded for this vehicle registration."
      case "business_license":
        return "No business permit documents uploaded for this verification request."
      case "driver_license":
        return "No driver's license documents uploaded for this verification request."
      case "passport":
        return "No passport documents uploaded for this verification request."
      case "id_card":
        return "No national ID documents uploaded for this verification request."
      case "payout_failed":
        return "This is a system payout failure that can be retried."
      case "refund_request":
        return "This is a refund request that requires admin action."
      case "reactivation_request":
        return "This is an account reactivation request that requires admin action."
      default:
        return "No documents uploaded for this verification request."
    }
  }

  // For action-based requests (no documents), don't show the gallery at all
  const isActionBasedRequest = ["payout_failed", "refund_request", "reactivation_request"].includes(docType)
  
  if (isActionBasedRequest) {
    return null // Don't render anything for action-based requests
  }

  if (!docUrls || docUrls.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">{getNoDocumentsMessage()}</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {docUrls
        .filter(Boolean)
        .map((docUrl, idx) => (
          <div
            key={`${docUrl}-${idx}`}
            className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onImageClick(docUrl!)}
          >
            <div className="w-16 h-16 relative mb-2">
              <Image
                src={getImageSrc(docUrl) || "/placeholder.svg"}
                alt={getDocumentName(idx)}
                fill
                className="object-cover rounded"
                unoptimized
              />
            </div>
            <div className="text-xs text-gray-600">
              <div className="font-medium">{getDocumentName(idx)}</div>
            </div>
          </div>
        ))}
    </div>
  )
}
