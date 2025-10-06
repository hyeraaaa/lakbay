"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  DollarSign,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { stripeService } from "@/services/stripeServices"
import { useNotification } from "@/components/NotificationProvider"
import { getCurrentUser } from "@/lib/jwt"
import { Skeleton } from "@/components/ui/skeleton"

interface StripeAccountStatus {
  isVerified: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId?: string;
  requirements?: {
    currently_due?: string[];
    past_due?: string[];
  };
}

export function StripeConnectSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null)
  const [error, setError] = useState<string>("")
  const { success: notifySuccess, error: notifyError } = useNotification()
  const user = getCurrentUser()

  // Check if user is an owner
  const isOwner = user?.user_type === 'owner'

  useEffect(() => {
    if (isOwner) {
      loadAccountStatus()
    } else {
      setIsLoading(false)
    }
  }, [isOwner])

  const loadAccountStatus = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const result = await stripeService.checkAccountStatus()
      
      if (result.ok) {
        setAccountStatus({
          isVerified: result.data.isVerified,
          payoutsEnabled: result.data.payoutsEnabled,
          detailsSubmitted: result.data.detailsSubmitted,
          accountId: result.data.accountId,
          requirements: result.data.requirements
        })
      } else {
        setError(result.message || "Failed to load account status")
      }
    } catch (err) {
      console.error("Error loading account status:", err)
      setError("Failed to load account status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOnboarding = async () => {
    try {
      setIsProcessing(true)
      setError("")
      
      const refreshUrl = `${window.location.origin}/settings?tab=stripe`
      const returnUrl = `${window.location.origin}/settings?tab=stripe&onboarding=complete`
      
      const result = await stripeService.startOnboarding(refreshUrl, returnUrl)
      
      if (result.ok) {
        // Redirect to Stripe onboarding
        window.location.href = result.data.onboardingUrl
      } else {
        setError(result.message || "Failed to start onboarding")
        notifyError(result.message || "Failed to start onboarding")
      }
    } catch (err) {
      console.error("Error starting onboarding:", err)
      setError("Failed to start onboarding")
      notifyError("Failed to start onboarding")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefreshStatus = async () => {
    await loadAccountStatus()
  }

  const getStatusBadge = () => {
    if (!accountStatus) return null

    if (accountStatus.isVerified && accountStatus.payoutsEnabled) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ready for Payouts
        </Badge>
      )
    } else if (accountStatus.detailsSubmitted) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending Verification
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Not Set Up
        </Badge>
      )
    }
  }

  const getStatusMessage = () => {
    if (!accountStatus) return ""

    if (accountStatus.isVerified && accountStatus.payoutsEnabled) {
      return "Your Stripe account is fully verified and ready to receive payouts from bookings."
    } else if (accountStatus.detailsSubmitted) {
      return "Your account details have been submitted to Stripe and are being reviewed. This usually takes a few minutes."
    } else {
      return "Set up your Stripe Connect account to start receiving payments from your vehicle bookings."
    }
  }

  const getRequirementsMessage = () => {
    if (!accountStatus?.requirements) return null

    const requirements = accountStatus.requirements
    const pendingRequirements = requirements.currently_due || []
    const pastDueRequirements = requirements.past_due || []

    if (pastDueRequirements.length > 0) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> Please complete the following requirements: {pastDueRequirements.join(", ")}
          </AlertDescription>
        </Alert>
      )
    }

    if (pendingRequirements.length > 0) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Additional Information Needed:</strong> {pendingRequirements.join(", ")}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect
            </CardTitle>
            <CardDescription>
              Payment processing for vehicle owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Stripe Connect is only available for vehicle owners. You need to become a host to access payment processing features.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect
            </CardTitle>
            <CardDescription>
              Loading your payment account status...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect
            </CardTitle>
            <CardDescription>
              Manage your payment processing account
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {getRequirementsMessage()}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-muted-foreground">
                  {getStatusMessage()}
                </p>
                {accountStatus?.accountId && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Account ID: {accountStatus.accountId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Platform Fees</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Platform fee: 5% of each booking</p>
                <p>• Owner receives: 95% of each booking</p>
                <p>• Payouts are processed automatically when bookings are completed</p>
              </div>
            </div>

            {(!accountStatus || !accountStatus.isVerified || !accountStatus.payoutsEnabled) && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleStartOnboarding}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {accountStatus ? "Complete Setup" : "Set Up Stripe Connect"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  You&apos;ll be redirected to Stripe to complete your account setup
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
