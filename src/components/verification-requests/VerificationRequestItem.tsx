"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  isSelected: boolean
  onMarkAsRead: (id: string) => void
  onToggleSelection: (id: string) => void
  formatDate: (dateString: string) => string
}

export default function VerificationRequestItem({
  request,
  isRead,
  isSelected,
  onMarkAsRead,
  onToggleSelection,
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
        className={`flex items-center gap-3 px-6 py-2 hover:shadow-sm hover:bg-muted/30 cursor-pointer group border-b border-border ${
          isRead ? "" : "bg-[whitesmoke]"
        }`}
        onClick={() => onMarkAsRead(request.verification_id)}
      >
        <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(request.verification_id)}
          />
        </div>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground w-40 truncate">
            {request.user?.name || `User ${request.user_id}`}
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

            <div
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1"
              onClick={(e) => e.preventDefault()}
            >
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
