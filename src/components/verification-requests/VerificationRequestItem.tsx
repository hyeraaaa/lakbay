"use client"

import { Button } from "@/components/ui/button"
import { Archive, Trash2, Mail, Clock } from "lucide-react"
import Link from "next/link"
import { encodeId } from "@/lib/idCodec"

interface VerificationRequest {
  verification_id: string
  user_id: string
  user?: {
    name: string
  }
  doc_type: string
  status: string
  submitted_at: string
}

interface VerificationRequestItemProps {
  request: VerificationRequest
  isRead: boolean
  onMarkAsRead: (id: string) => void
  formatDate: (dateString: string) => string
}

export default function VerificationRequestItem({
  request,
  isRead,
  onMarkAsRead,
  formatDate,
}: VerificationRequestItemProps) {
  const getRequestTypeLabel = (docType: string) => {
    switch (docType) {
      case "business_license":
        return "Business Permit Verification Request"
      case "vehicle_registration":
        return "Vehicle Registration Request"
      case "payout_failed":
        return "Failed Payout Request"
      case "refund_request":
        return "Refund Request"
      case "reactivation_request":
        return "Account Reactivation Request"
      default:
        return "Account Verification Request"
    }
  }

  return (
    <Link
      prefetch={false}
      href={`/admin/verification-requests/request-body/${encodeId(request.verification_id)}`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-2 hover:bg-muted/30 cursor-pointer group border-b border-border"
        }`}
        onClick={() => onMarkAsRead(request.verification_id)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground w-40 truncate">
            {request.doc_type === "payout_failed" 
              ? `Owner ${request.user_id}` 
              : request.user?.name || `User ${request.user_id}`}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground truncate">
                {getRequestTypeLabel(request.doc_type)}
              </span>
              {request.status === "pending" && (
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-xs text-muted-foreground">{formatDate(request.submitted_at)}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
