"use client"

import { useState, useEffect } from "react"
import { verificationService, type VerificationRequest } from "@/services/verificationServices"
import { registrationService } from "@/services/registrationService"
import { ownerEnrollmentService } from "@/services/ownerEnrollmentService"
import { adminReviewService, type AdminReviewItem } from "@/services/adminReviewService"
import { adminPayoutService } from "@/services/adminPayoutService"
import { refundsDisputesService } from "@/services/refundsDisputesService"
import { adminUserService } from "@/services/adminUserService"
import { getAccessToken } from "@/lib/jwt"

// Extended interface to handle all types of requests
interface ExtendedRequest extends VerificationRequest {
  vehicle?: {
    brand: string
    model: string
    year: number
  }
  isRegistration?: boolean
}

export function useVerificationRequest(id: string | undefined) {
  const [request, setRequest] = useState<ExtendedRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fetchRequest = async (requestId: string) => {
    try {
      setLoading(true)
      
      // Prefer unified admin review endpoint
      const item: AdminReviewItem | null = await adminReviewService.getById(requestId)
      if (item) {
        setRequest(item)
        return
      }
      // Fallback to legacy verification endpoint for safety
      const legacy = await verificationService.getById(requestId)
      setRequest(legacy)
    } catch (e) {
      console.error("Error fetching request:", e)
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (
    verificationId: string,
    options?: { refundPercentage?: number }
  ) => {
    setActionLoading(true)
    try {
      let success = false
      
      // Check if this is a vehicle registration
      if (verificationId.startsWith('reg_')) {
        const registrationId = verificationId.replace('reg_', '')
        try {
          await registrationService.reviewRegistration(parseInt(registrationId), "approved", "Registration approved")
          success = true
        } catch (error) {
          console.error("Error approving registration:", error)
          return false
        }
      }
      // Check if this is a business permit/host enrollment (owner enrollment)
      else if (verificationId.startsWith('owner_')) {
        const ownerId = verificationId.replace('owner_', '')
        try {
          success = await ownerEnrollmentService.approve(ownerId)
        } catch (error) {
          console.error("Error approving owner enrollment:", error)
          return false
        }
      }
      // Check if this is a verification request
      else if (verificationId.startsWith('ver_')) {
        const verId = verificationId.replace('ver_', '')
        success = await verificationService.approve(verId)
      }
      // Check if this is a failed payout request
      else if (verificationId.startsWith('payout_')) {
        const payoutId = verificationId.replace('payout_', '')
        try {
          await adminPayoutService.retryPayout(parseInt(payoutId))
          success = true
        } catch (error) {
          console.error("Error retrying payout:", error)
          return false
        }
      }
      // Check if this is a refund request
      else if (verificationId.startsWith('refund_')) {
        const refundId = verificationId.replace('refund_', '')
        try {
          await refundsDisputesService.approveRefund(
            parseInt(refundId),
            "Refund approved",
            options?.refundPercentage !== undefined ? { refundPercentage: options.refundPercentage } : undefined
          )
          success = true
        } catch (error) {
          console.error("Error approving refund:", error)
          return false
        }
      }
      // Check if this is a reactivation request
      else if (verificationId.startsWith('reactivation_')) {
        // For reactivation requests, verificationId encodes the reactivation request id,
        // but the admin API expects the USER ID in the URL. Use the loaded request.user_id.
        const userIdFromRequest = request?.user_id
        if (!userIdFromRequest) {
          console.error("Missing user_id on reactivation request; cannot approve")
          return false
        }
        try {
          await adminUserService.approveReactivation(parseInt(String(userIdFromRequest)))
          success = true
        } catch (error) {
          console.error("Error approving reactivation:", error)
          return false
        }
      }
      // Legacy fallback for numeric IDs (owner enrollment)
      else if (/^\d+$/.test(verificationId)) {
        try {
          success = await ownerEnrollmentService.approve(verificationId)
        } catch (error) {
          console.error("Error approving owner enrollment:", error)
          return false
        }
      }
      // Legacy verification approval
      else {
        success = await verificationService.approve(verificationId)
      }
      
      // Update the request status locally if successful
      if (success && request) {
        setRequest(prev => prev ? { ...prev, status: 'approved' } : null)
      }
      
      return success
    } finally {
      setActionLoading(false)
    }
  }

  const rejectRequest = async (verificationId: string) => {
    setActionLoading(true)
    try {
      let success = false
      
      // Check if this is a vehicle registration
      if (verificationId.startsWith('reg_')) {
        const registrationId = verificationId.replace('reg_', '')
        try {
          await registrationService.reviewRegistration(parseInt(registrationId), "rejected", "Registration rejected")
          success = true
        } catch (error) {
          console.error("Error rejecting registration:", error)
          return false
        }
      }
      // Check if this is a business permit/host enrollment (owner enrollment)
      else if (verificationId.startsWith('owner_')) {
        const ownerId = verificationId.replace('owner_', '')
        try {
          success = await ownerEnrollmentService.reject(ownerId)
        } catch (error) {
          console.error("Error rejecting owner enrollment:", error)
          return false
        }
      }
      // Check if this is a verification request
      else if (verificationId.startsWith('ver_')) {
        const verId = verificationId.replace('ver_', '')
        success = await verificationService.reject(verId)
      }
      // Check if this is a failed payout request
      else if (verificationId.startsWith('payout_')) {
        // For payouts, rejection might not be applicable, but we can mark as reviewed
        // This would depend on the business logic - for now, we'll just return success
        success = true
      }
      // Check if this is a refund request
      else if (verificationId.startsWith('refund_')) {
        const refundId = verificationId.replace('refund_', '')
        try {
          await refundsDisputesService.rejectRefund(parseInt(refundId), "Refund rejected")
          success = true
        } catch (error) {
          console.error("Error rejecting refund:", error)
          return false
        }
      }
      // Check if this is a reactivation request
      else if (verificationId.startsWith('reactivation_')) {
        // For reactivation requests, verificationId encodes the reactivation request id,
        // but the admin API expects the USER ID in the URL. Use the loaded request.user_id.
        const userIdFromRequest = request?.user_id
        if (!userIdFromRequest) {
          console.error("Missing user_id on reactivation request; cannot reject")
          return false
        }
        try {
          await adminUserService.rejectReactivation(parseInt(String(userIdFromRequest)), "Reactivation request rejected")
          success = true
        } catch (error) {
          console.error("Error rejecting reactivation:", error)
          return false
        }
      }
      // Legacy fallback for numeric IDs (owner enrollment)
      else if (/^\d+$/.test(verificationId)) {
        try {
          success = await ownerEnrollmentService.reject(verificationId)
        } catch (error) {
          console.error("Error rejecting owner enrollment:", error)
          return false
        }
      }
      // Legacy verification rejection
      else {
        success = await verificationService.reject(verificationId)
      }
      
      // Update the request status locally if successful
      if (success && request) {
        setRequest(prev => prev ? { ...prev, status: 'rejected' } : null)
      }
      
      return success
    } finally {
      setActionLoading(false)
    }
  }

  const openImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeImage = () => {
    setSelectedImage(null)
  }

  const getImageSrc = (path?: string | null) => {
    return verificationService.getImageSrc(path)
  }

  useEffect(() => {
    if (id) {
      fetchRequest(id)
    }
  }, [id])

  return {
    // Data and loading state
    request,
    loading,
    actionLoading,
    refetch: () => id && fetchRequest(id),
    // Action functions
    approveRequest,
    rejectRequest,
    // Image modal state and functions
    selectedImage,
    openImage,
    closeImage,
    // Utility functions
    getImageSrc,
  }
}

export type { VerificationRequest, ExtendedRequest }
