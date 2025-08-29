"use client"

import { useState, useCallback, useEffect } from "react"
import { getAccessToken } from "@/lib/jwt"

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

  // Check verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/verification/status", {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        })

        if (response.ok) {
          const status = await response.json()
          setVerificationStatus(status)
          
          // If user already has verification, set appropriate state
          if (status.hasVerification) {
            if (status.verification?.status === 'pending') {
              setIsInReview(true)
            } else if (status.verification?.status === 'approved') {
              setIsInReview(true)
            }
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    checkVerificationStatus()
  }, [])

  const captureImageForStep = useCallback(
    (imageData: string) => {
      setCapturedImages((prev) => ({
        ...prev,
        [currentStep]: imageData,
      }))

      if (currentStep === "front") {
        setCurrentStep("back")
      } else {
        setCurrentStep("complete")
      }
    },
    [currentStep],
  )

  const retakePhoto = useCallback((side: "front" | "back") => {
    setCapturedImages((prev) => ({
      ...prev,
      [side]: undefined,
    }))
    setCurrentStep(side)
  }, [])

  const base64ToFile = useCallback((base64String: string, filename: string): File => {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '')
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })
    
    return new File([blob], filename, { type: 'image/jpeg' })
  }, [])

  const compressImage = useCallback((base64String: string, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Calculate new dimensions (maintain aspect ratio)
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = base64String
    })
  }, [])

  const mapIdTypeToServer = useCallback((clientIdType: IDType): string => {
    const typeMap: Record<IDType, string> = {
      'drivers-license': 'driver_license',
      'passport': 'passport',
      'national-id': 'id_card',
      'state-id': 'id_card'
    }
    return typeMap[clientIdType]
  }, [])

  const mapServerToClientIdType = useCallback((serverDocType: string): IDType => {
    const reverseTypeMap: Record<string, IDType> = {
      'driver_license': 'drivers-license',
      'passport': 'passport',
      'id_card': 'national-id', // Default to national-id for id_card
      'business_license': 'national-id' // Default to national-id for business_license
    }
    return reverseTypeMap[serverDocType] || 'drivers-license' // Default fallback
  }, [])

  const handleSubmit = useCallback(async () => {
    // Prevent submission if verification already exists
    if (verificationStatus?.hasVerification) {
      alert("You have already submitted verification documents. Please wait for review.")
      return
    }

    if (!selectedIdType || !capturedImages.front || !capturedImages.back) {
      alert("Please complete all steps before submitting.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Convert base64 images to File objects
      const frontFile = base64ToFile(capturedImages.front!, 'front-id.jpg')
      const backFile = base64ToFile(capturedImages.back!, 'back-id.jpg')

      // Use FormData instead of JSON to handle large files
      const formData = new FormData()
      formData.append('documentType', mapIdTypeToServer(selectedIdType as IDType))
      formData.append('documentFront', frontFile)
      formData.append('documentBack', backFile)

      const response = await fetch("http://localhost:3000/api/verification/submit", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: formData, 
      })

      if (!response.ok) {
        throw new Error(`Verification submission failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Verification submitted successfully:", result)

      setIsInReview(true)
      alert("Verification submitted successfully! We will review your documents within 24-48 hours.")
      
      // Refresh verification status after successful submission
      const statusResponse = await fetch("http://localhost:3000/api/verification/status", {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      })
      
      if (statusResponse.ok) {
        const status = await statusResponse.json()
        setVerificationStatus(status)
      }
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
    [selectedIdType, capturedImages],
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
    handleSubmit,
    getStepStatus,
    mapServerToClientIdType,
  }
}
