"use client"

import { useState, useCallback, useEffect } from "react"
import { verificationService } from "@/services/verificationServices"

export type IDType = "drivers-license" | "passport" | "national-id" | "state-id"
export type CaptureStep = "front" | "back" | "complete"

interface CapturedImage {
  front?: string
  back?: string
}

interface VerificationStatus {
  hasVerification: boolean
  verification: {
    id: number
    docType: string
    docUrl: string
    status: string
    submittedAt: string
    reviewedAt?: string
    notes?: string
  } | null
  userStatus: {
    isVerified: boolean
    isEmailVerified: boolean
    isPhoneVerified: boolean
  }
}

export const useVerification = () => {
  const [selectedIdType, setSelectedIdType] = useState<IDType | "">("")
  const [currentStep, setCurrentStep] = useState<CaptureStep>("front")
  const [capturedImages, setCapturedImages] = useState<CapturedImage>({})
  const [isInReview, setIsInReview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isResubmitting, setIsResubmitting] = useState(false)

  // Check verification status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await verificationService.getStatus()
        setVerificationStatus(status)

        // Only treat as "in review" when there is a pending submission.
        // Allow resubmission when last verification was approved but the user's current
        // profile is no longer verified, or when the last verification was rejected.
        if (status.hasVerification && status.verification?.status === "pending") {
          setIsInReview(true)
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      } finally {
        setIsLoadingStatus(false)
      }
    }
    fetchStatus()
  }, [])

  const captureImageForStep = useCallback(
    (imageData: string) => {
      setCapturedImages((prev) => ({
        ...prev,
        [currentStep]: imageData
      }))

      if (currentStep === "front") setCurrentStep("back")
      else setCurrentStep("complete")
    },
    [currentStep]
  )

  const retakePhoto = useCallback((side: "front" | "back") => {
    setCapturedImages((prev) => ({
      ...prev,
      [side]: undefined
    }))
    setCurrentStep(side)
  }, [])

  const beginResubmission = useCallback(() => {
    setIsInReview(false)
    setIsResubmitting(true)
    setSelectedIdType("")
    setCapturedImages({})
    setCurrentStep("front")
  }, [])

  const base64ToFile = useCallback((base64String: string, filename: string): File => {
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "")
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "image/jpeg" })
    return new File([blob], filename, { type: "image/jpeg" })
  }, [])

  const mapIdTypeToServer = useCallback((clientIdType: IDType): string => {
    const typeMap: Record<IDType, string> = {
      "drivers-license": "driver_license",
      passport: "passport",
      "national-id": "id_card",
      "state-id": "id_card"
    }
    return typeMap[clientIdType]
  }, [])

  const mapServerToClientIdType = useCallback((serverDocType: string): IDType => {
    const reverseTypeMap: Record<string, IDType> = {
      driver_license: "drivers-license",
      passport: "passport",
      id_card: "national-id",
      business_license: "national-id"
    }
    return reverseTypeMap[serverDocType] || "drivers-license"
  }, [])

  const handleSubmit = useCallback(async () => {
    // Block if there is an active pending verification or the user is already verified.
    if (verificationStatus?.verification?.status === "pending") {
      alert("You have already submitted verification documents. Please wait for review.")
      return
    }
    if (verificationStatus?.userStatus?.isVerified) {
      alert("Your account is already verified. No further submission is required.")
      return
    }

    if (!selectedIdType || !capturedImages.front || !capturedImages.back) {
      alert("Please complete all steps before submitting.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const frontFile = base64ToFile(capturedImages.front!, "front-id.jpg")
      const backFile = base64ToFile(capturedImages.back!, "back-id.jpg")

      await verificationService.submit(mapIdTypeToServer(selectedIdType as IDType), frontFile, backFile)

      setIsInReview(true)
      alert("Verification submitted successfully! We will review your documents within 24-48 hours.")

      // Refresh verification status
      const status = await verificationService.getStatus()
      setVerificationStatus(status)
    } catch (error) {
      console.error("Error submitting verification:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit verification")
      alert("Failed to submit verification. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedIdType, capturedImages, base64ToFile, mapIdTypeToServer, verificationStatus])

  const getStepStatus = useCallback(
    (step: number) => {
      if (step === 1) return selectedIdType ? "complete" : "current"
      if (step === 2) return capturedImages.front ? "complete" : selectedIdType ? "current" : "pending"
      if (step === 3) return capturedImages.back ? "complete" : capturedImages.front ? "current" : "pending"
      return "pending"
    },
    [selectedIdType, capturedImages]
  )

  return {
    selectedIdType,
    setSelectedIdType,
    currentStep,
    setCurrentStep,
    capturedImages,
    isInReview,
    isSubmitting,
    submitError,
    verificationStatus,
    isLoadingStatus,
    captureImageForStep,
    retakePhoto,
    beginResubmission,
    isResubmitting,
    handleSubmit,
    getStepStatus,
    mapServerToClientIdType
  }
}
