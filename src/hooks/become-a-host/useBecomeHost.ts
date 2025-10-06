"use client"

import { useState, useEffect } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { hostEnrollmentService } from "@/services/hostEnrollmentService"
import { verificationService } from "@/services/verificationServices"

export interface VerificationStatus {
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

export function useHostVerification() {
  const { user, isLoading: isAuthLoading, updateUser } = useJWT()
  const [isAccountVerified, setIsAccountVerified] = useState<boolean | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (isAuthLoading) return

    const fetchVerificationStatus = async () => {
      try {
        const status = await verificationService.getStatus()
        const serverIsVerified = !!status?.userStatus?.isVerified
        setIsAccountVerified(serverIsVerified)

        if (serverIsVerified && !user?.is_verified) {
          updateUser({ is_verified: true })
        }
      } catch (_) {
        setIsAccountVerified(!!user?.is_verified)
      }
    }

    fetchVerificationStatus()

    if (!user?.is_verified) {
      setIsLoading(false)
      return
    }

    loadExistingEnrollment()
  }, [isAuthLoading, user?.is_verified, updateUser])

  const loadExistingEnrollment = async () => {
    try {
      const enrollment = await hostEnrollmentService.getCurrentEnrollment()

      if (enrollment) {
        setVerificationStatus({
          hasVerification: true,
          verification: {
            id: enrollment.request_id,
            docType: "business_permit",
            docUrl: enrollment.permit_url,
            status: enrollment.status,
            submittedAt: enrollment.submitted_at,
            reviewedAt: enrollment.reviewed_at || undefined,
            notes: enrollment.notes || undefined,
          },
          userStatus: {
            isVerified: false,
            isEmailVerified: true,
            isPhoneVerified: true,
          },
        })
      } else {
        setVerificationStatus(null)
      }
    } catch (error) {
      console.error("Failed to load enrollment:", error)
      setVerificationStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  const submitBusinessPermit = async (file: File, garageLocationName: string, garageCoordinates?: string | null) => {
    setIsSubmitting(true)
    setError("")
    try {
      await hostEnrollmentService.submitEnrollment(file, garageLocationName, garageCoordinates)
      await loadExistingEnrollment()
    } catch (error) {
      console.error("Submission failed:", error)
      const message = error instanceof Error ? error.message : "Submission failed"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resubmitApplication = () => {
    setVerificationStatus(null)
  }

  return {
    isAccountVerified,
    verificationStatus,
    isSubmitting,
    isLoading: isAuthLoading || isLoading,
    error,
    setError,
    submitBusinessPermit,
    resubmitApplication,
  }
}
