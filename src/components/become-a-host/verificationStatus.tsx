"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Building } from "lucide-react"

interface HostVerificationStatusProps {
  verificationStatus?: {
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
  onResubmit?: () => void
}

export const HostVerificationStatus = ({ verificationStatus, onResubmit }: HostVerificationStatusProps) => {
  const getStatusIcon = () => {
    if (!verificationStatus?.verification) return <Clock className="h-5 w-5 mr-2" />

    switch (verificationStatus.verification.status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 mr-2 text-red-600" />
      default:
        return <Clock className="h-5 w-5 mr-2" />
    }
  }

  const getStatusTitle = () => {
    if (!verificationStatus?.verification) return "Host Application In Review"

    switch (verificationStatus.verification.status) {
      case "approved":
        return "Host Application Approved"
      case "rejected":
        return "Host Application Rejected"
      default:
        return "Host Application In Review"
    }
  }

  const getStatusDescription = () => {
    if (!verificationStatus?.verification) return "Your business permit is being reviewed by our team"

    switch (verificationStatus.verification.status) {
      case "approved":
        return "Congratulations! Your host application has been approved. You can now start listing your properties."
      case "rejected":
        return "Your host application was not approved. Please review the notes below and resubmit."
      default:
        return "Your business permit is being reviewed by our team"
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStatusIcon()}
          {getStatusTitle()}
        </CardTitle>
        <CardDescription>{getStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start">
            <Building className="h-5 w-5 text-foreground mr-2 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Submitted Information:</p>
              <p className="text-muted-foreground">
                <strong>Document Type:</strong> Business Permit
              </p>

              {verificationStatus?.verification && (
                <>
                  <p className="text-muted-foreground">
                    <strong>Submitted:</strong>{" "}
                    {new Date(verificationStatus.verification.submittedAt).toLocaleDateString()}
                  </p>

                  {verificationStatus.verification.reviewedAt && (
                    <p className="text-muted-foreground">
                      <strong>Reviewed:</strong>{" "}
                      {new Date(verificationStatus.verification.reviewedAt).toLocaleDateString()}
                    </p>
                  )}

                  {verificationStatus.verification.notes && (
                    <p className="text-muted-foreground">
                      <strong>Notes:</strong> {verificationStatus.verification.notes}
                    </p>
                  )}
                </>
              )}

              {verificationStatus?.verification?.status === "pending" && (
                <p className="text-muted-foreground">
                  We will review your business permit within 24-48 hours and notify you of the application status.
                </p>
              )}
            </div>
          </div>
        </div>
        {verificationStatus?.verification?.status === "rejected" && (
                <div className="pt-5 w-full">
                  <Button className="w-full" onClick={onResubmit}>Resubmit Application</Button>
                </div>
              )}
      </CardContent>
    </Card>
  )
}
