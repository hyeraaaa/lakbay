"use client"

import { BusinessPermitUpload } from "@/components/become-a-host/businessPermitUpload"
import { HostVerificationStatus } from "@/components/become-a-host/verificationStatus"
import { useHostVerification } from "@/hooks/become-a-host/useBecomeHost"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { useNotification } from "@/components/NotificationProvider"
import { Skeleton } from "@/components/ui/skeleton"

export default function BecomeHostPage() {
  const { error: showError } = useNotification()
  const { isAccountVerified, verificationStatus, isSubmitting, isLoading, error, setError, submitBusinessPermit, resubmitApplication } =
    useHostVerification()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingGarage, setPendingGarage] = useState<string>("")
  const [pendingCoordinates, setPendingCoordinates] = useState<string | null>(null)

  // Show error notification when error changes
  useEffect(() => {
    if (error) {
      showError(error)
      setError("") // Clear the error after showing notification
    }
  }, [error, showError, setError])

  const handleFileSubmit = (file: File, garageLocationName: string, garageCoordinates?: string | null) => {
    setPendingFile(file)
    setPendingGarage(garageLocationName)
    setPendingCoordinates(garageCoordinates || null)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingFile || !pendingGarage) return
    await submitBusinessPermit(pendingFile, pendingGarage, pendingCoordinates)
    setConfirmOpen(false)
    setPendingFile(null)
    setPendingGarage("")
    setPendingCoordinates(null)
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {!isLoading && isAccountVerified && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Become a Host</h1>
            <p className="text-muted-foreground">
              Start your hosting your car by submitting your business permit for verification
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="py-8">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-80 mx-auto mt-3" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full col-span-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        ) : !isAccountVerified ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-black mb-4">Verify Your Account</h1>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-sm mx-auto">
              Complete verification to unlock hosting and start earning with your car.
            </p>

            <div className="border-l-4 border-black pl-6 mb-8 text-left max-w-sm mx-auto">
              <p className="text-sm font-medium text-black mb-1">Quick Process</p>
              <p className="text-sm text-gray-500">Takes just a few minutes to complete</p>
            </div>

            <Link href="/account-verification" className="block">
              <Button size="lg" className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base font-medium">
                Verify Account
              </Button>
            </Link>

            <p className="text-xs text-gray-400 mt-6">Return here after completing verification</p>
          </div>
        ) : verificationStatus?.hasVerification ? (
          <HostVerificationStatus verificationStatus={verificationStatus} onResubmit={resubmitApplication} />
        ) : (
          <BusinessPermitUpload onSubmit={handleFileSubmit} isSubmitting={isSubmitting} />
        )}
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Submit application?"
          description="We'll review your business permit. You won't be able to edit while it's under review. Continue?"
          confirmText="Submit"
          cancelText="Cancel"
          variant="default"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setPendingFile(null)}
        />
      </div>
    </div>
  )
}
