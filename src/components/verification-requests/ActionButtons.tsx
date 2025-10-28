"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { useNotification } from "@/components/NotificationProvider"

interface ActionButtonsProps {
  status: string
  actionLoading: boolean
  onApprove: (options?: { refundPercentage?: number }) => void
  onReject: () => void
  requestType?: string
}

export default function ActionButtons({
  status,
  actionLoading,
  onApprove,
  onReject,
  requestType,
}: ActionButtonsProps) {
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const { success, error } = useNotification()
  const isPayoutRequest = requestType === "payout_failed"
  const isRefundRequest = requestType === "refund_request"
  const [refundPercentage, setRefundPercentage] = useState<string>("100")
  const [refundError, setRefundError] = useState<string>("")
  if (status !== "pending") {
    return null
  }

  const approveButtonText = isPayoutRequest ? "Retry Payout" : "Approve"

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
      {isRefundRequest && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-900">Refund percentage</div>
              <div className="text-xs text-gray-500">Enter a value from 1 to 100. Defaults to 100%.</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                step={1}
                value={refundPercentage}
                onChange={(e) => {
                  setRefundPercentage(e.target.value)
                  setRefundError("")
                }}
                onBlur={() => {
                  const n = Number(refundPercentage)
                  if (!Number.isFinite(n)) {
                    setRefundPercentage("100")
                    return
                  }
                  const clamped = Math.min(100, Math.max(1, Math.floor(n)))
                  if (clamped !== n) {
                    setRefundPercentage(String(clamped))
                  }
                }}
                className="w-24 text-right"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>
          {refundError ? (
            <div className="mt-2 text-xs text-red-600">{refundError}</div>
          ) : null}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-start">
      <Button 
        onClick={() => setConfirmApproveOpen(true)} 
        disabled={approveLoading || rejectLoading}
        className="bg-black hover:bg-neutral-900 text-white rounded-full px-6 disabled:opacity-50"
      >
        {approveLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        {approveButtonText}
      </Button>
      {!isPayoutRequest && (
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
      )}
      </div>
      <ConfirmationDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title={isPayoutRequest ? "Retry payout?" : (isRefundRequest ? "Process refund?" : "Approve verification?")}
        description={isPayoutRequest 
          ? "This will retry the failed payout to the owner."
          : (isRefundRequest
              ? (
                <div className="space-y-1">
                  <div>This will process the refund for the specified percentage.</div>
                  <div className="text-gray-700"><span className="font-medium">Selected:</span> {Number.isFinite(Number(refundPercentage)) ? `${Math.min(100, Math.max(1, Math.floor(Number(refundPercentage))))}%` : '100%'} refund</div>
                </div>
              )
              : "This will mark the user's verification as approved.")}
        confirmText={approveButtonText}
        onConfirm={async () => {
          try {
            setApproveLoading(true)
            let pct = Number(refundPercentage)
            if (isRefundRequest) {
              if (!Number.isFinite(pct)) {
                setRefundError("Please enter a valid number between 1 and 100.")
                setApproveLoading(false)
                return
              }
              if (pct < 1 || pct > 100) {
                setRefundError("Refund percentage must be between 1 and 100.")
                setApproveLoading(false)
                return
              }
              pct = Math.floor(pct)
            }
            await Promise.resolve(onApprove(isRefundRequest ? { refundPercentage: pct } : undefined))
            success(
              isPayoutRequest
                ? "Payout retry initiated"
                : (isRefundRequest ? "Refund processed" : "Verification approved")
            )
            setConfirmApproveOpen(false)
          } catch (e: unknown) {
            error(
              e instanceof Error
                ? e.message
                : `Failed to ${isPayoutRequest ? "retry payout" : (isRefundRequest ? "process refund" : "approve")}`
            )
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
