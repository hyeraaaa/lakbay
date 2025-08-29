"use client"

import { Shield } from "lucide-react"
import { useVerification } from "@/hooks/account-verification/useVerification"
import { IDTypeSelector } from "@/components/account-verification/id-type-selector"
import { CameraCapture } from "@/components/account-verification/camera-capture"
import { VerificationReview } from "@/components/account-verification/verification-review"
import { VerificationProgress } from "@/components/account-verification/verification-progress"
import { VerificationStatus } from "@/components/account-verification/verification-status"
import { UserRoute } from "@/components/auth/ProtectedRoute"

const AccountVerification = () => {
  const {
    selectedIdType,
    setSelectedIdType,
    currentStep,
    setCurrentStep,
    capturedImages,
    isInReview,
    verificationStatus,
    isLoadingStatus,
    captureImageForStep,
    retakePhoto,
    handleSubmit,
    getStepStatus,
    mapServerToClientIdType,
  } = useVerification()

  // Show loading state while checking verification status
  if (isLoadingStatus) {
    return (
      <UserRoute>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking verification status...</p>
          </div>
        </div>
      </UserRoute>
    )
  }

  // If user already has verification, show status
  if (verificationStatus?.hasVerification) {
    return (
      <UserRoute>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-foreground mr-2" />
              <h1 className="text-3xl font-bold text-foreground">Account Verification</h1>
            </div>
            <p className="text-muted-foreground">Your verification status</p>
          </div>
          
          <VerificationStatus 
            selectedIdType={mapServerToClientIdType(verificationStatus.verification?.docType || "driver_license")} 
            verificationStatus={verificationStatus}
          />
        </div>
      </UserRoute>
    )
  }

  return (
    <UserRoute>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-foreground mr-2" />
            <h1 className="text-3xl font-bold text-foreground">Account Verification</h1>
          </div>
          <p className="text-muted-foreground">Securely capture your ID for verification</p>
        </div>

        {!isInReview && !(capturedImages.front && capturedImages.back) && (
          <VerificationProgress getStepStatus={getStepStatus} />
        )}

        {isInReview && selectedIdType && (
          <VerificationStatus 
            selectedIdType={selectedIdType} 
            verificationStatus={verificationStatus || undefined}
          />
        )}

        {!isInReview && (
          <>
            {!selectedIdType && !(capturedImages.front && capturedImages.back) && (
              <IDTypeSelector selectedIdType={selectedIdType} onSelectIdType={setSelectedIdType} />
            )}

            {selectedIdType && !(capturedImages.front && capturedImages.back) && (
              <CameraCapture
                selectedIdType={selectedIdType}
                currentStep={currentStep}
                capturedImage={capturedImages[currentStep as keyof typeof capturedImages]}
                onImageCaptured={captureImageForStep}
                onRetakePhoto={retakePhoto}
                onContinue={() => setCurrentStep("back")}
              />
            )}

            {capturedImages.front && capturedImages.back && selectedIdType && (
              <VerificationReview
                selectedIdType={selectedIdType}
                frontImage={capturedImages.front}
                backImage={capturedImages.back}
                onSelectIdType={setSelectedIdType}
                onRetakePhoto={retakePhoto}
                onSubmit={handleSubmit}
              />
            )}
          </>
        )}
      </div>
    </UserRoute>
  )
}

export default AccountVerification
