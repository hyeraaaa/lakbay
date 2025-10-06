"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { useNotification } from "@/components/NotificationProvider"

interface ActionButtonsProps {
  status: string
  actionLoading: boolean
  onApprove: () => void
  onReject: () => void
}

export default function ActionButtons({
  status,
  actionLoading,
  onApprove,
  onReject,
}: ActionButtonsProps) {
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const { success, error } = useNotification()
  if (status !== "pending") {
    return null
  }

  return (
    <div className="flex gap-3 pt-4 border-t border-gray-200">
      <Button 
        onClick={() => setConfirmApproveOpen(true)} 
        disabled={approveLoading || rejectLoading}
        className="bg-black hover:bg-neutral-900 text-white rounded-full px-6 disabled:opacity-50"
      >
        {approveLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Approve
      </Button>
      <Button
        variant="outline"
        onClick={() => setConfirmRejectOpen(true)}
        disabled={approveLoading || rejectLoading}
        className="text-gray-700 border-gray-300 hover:bg-gray-50 rounded-full px-6 bg-transparent disabled:opacity-50"
      >
        {rejectLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Reject
      </Button>
      <ConfirmationDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Approve verification?"
        description="This will mark the user's verification as approved."
        confirmText="Approve"
        onConfirm={async () => {
          try {
            setApproveLoading(true)
            await Promise.resolve(onApprove())
            success("Verification approved")
            setConfirmApproveOpen(false)
          } catch (e: unknown) {
            error(e instanceof Error ? e.message : "Failed to approve")
          } finally {
            setApproveLoading(false)
          }
        }}
      />
      <ConfirmationDialog
        open={confirmRejectOpen}
        onOpenChange={setConfirmRejectOpen}
        title="Reject verification?"
        description="This will reject the user's verification request."
        confirmText="Reject"
        onConfirm={async () => {
          try {
            setRejectLoading(true)
            await Promise.resolve(onReject())
            success("Verification rejected")
            setConfirmRejectOpen(false)
          } catch (e: unknown) {
            error(e instanceof Error ? e.message : "Failed to reject")
          } finally {
            setRejectLoading(false)
          }
        }}
      />
    </div>
  )
}
