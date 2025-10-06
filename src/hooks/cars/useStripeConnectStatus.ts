"use client"

import { useState, useEffect, useCallback } from "react"
import { stripeService, type AccountStatusResponse } from "@/services/stripeServices"
import { useJWT } from "@/contexts/JWTContext"

export interface StripeConnectStatus {
  isLoading: boolean
  isConnected: boolean
  isVerified: boolean
  needsSetup: boolean
  accountStatus: AccountStatusResponse | null
  error: string | null
}

export function useStripeConnectStatus() {
  const { user } = useJWT()
  const [status, setStatus] = useState<StripeConnectStatus>({
    isLoading: true,
    isConnected: false,
    isVerified: false,
    needsSetup: false,
    accountStatus: null,
    error: null
  })

  const checkStatus = useCallback(async () => {
    // Only check for owners
    if (user?.user_type !== 'owner') {
      setStatus({
        isLoading: false,
        isConnected: true, // Non-owners don't need Stripe
        isVerified: true,
        needsSetup: false,
        accountStatus: null,
        error: null
      })
      return
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await stripeService.checkAccountStatus()
      
      if (result.ok) {
        const accountStatus = result.data
        setStatus({
          isLoading: false,
          isConnected: !!accountStatus.accountId,
          isVerified: accountStatus.isVerified,
          needsSetup: !accountStatus.accountId || !accountStatus.isVerified,
          accountStatus,
          error: null
        })
      } else {
        setStatus({
          isLoading: false,
          isConnected: false,
          isVerified: false,
          needsSetup: true,
          accountStatus: null,
          error: result.message || 'Failed to check Stripe Connect status'
        })
      }
    } catch (error) {
      console.error('Error checking Stripe Connect status:', error)
      setStatus({
        isLoading: false,
        isConnected: false,
        isVerified: false,
        needsSetup: true,
        accountStatus: null,
        error: error instanceof Error ? error.message : 'Failed to check Stripe Connect status'
      })
    }
  }, [user])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return {
    ...status,
    refetch: checkStatus
  }
}
