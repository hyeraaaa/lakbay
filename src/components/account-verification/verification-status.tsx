import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Shield, CheckCircle, XCircle } from "lucide-react"
import type { IDType } from "@/hooks/account-verification/useVerification"
import { ID_TYPES } from "./id-type-selector"

interface VerificationStatusProps {
  selectedIdType: IDType
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

export const VerificationStatus = ({ selectedIdType, verificationStatus, onResubmit }: VerificationStatusProps) => {
  const getStatusIcon = () => {
    if (!verificationStatus?.verification) return <Clock className="h-5 w-5 mr-2" />
    
    switch (verificationStatus.verification.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 mr-2 text-red-600" />
      default:
        return <Clock className="h-5 w-5 mr-2" />
    }
  }

  const getStatusTitle = () => {
    if (!verificationStatus?.verification) return "Verification In Review"
    
    switch (verificationStatus.verification.status) {
      case 'approved':
        return "Verification Approved"
      case 'rejected':
        return "Verification Rejected"
      default:
        return "Verification In Review"
    }
  }

  const getStatusDescription = () => {
    if (!verificationStatus?.verification) return "Your documents are being reviewed by our team"
    
    switch (verificationStatus.verification.status) {
      case 'approved':
        return "Your verification has been approved! You can now access all features."
      case 'rejected':
        return "Your verification was not approved. Please review the notes below and resubmit."
      default:
        return "Your documents are being reviewed by our team"
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
            <Shield className="h-5 w-5 text-foreground mr-2 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Submitted Information:</p>
              <p className="text-muted-foreground">
                <strong>ID Type:</strong> {ID_TYPES.find((t) => t.value === selectedIdType)?.label}
              </p>
              
              {verificationStatus?.verification && (
                <>
                  <p className="text-muted-foreground">
                    <strong>Submitted:</strong> {new Date(verificationStatus.verification.submittedAt).toLocaleDateString()}
                  </p>
                  
                  {verificationStatus.verification.reviewedAt && (
                    <p className="text-muted-foreground">
                      <strong>Reviewed:</strong> {new Date(verificationStatus.verification.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {verificationStatus.verification.notes && (
                    <p className="text-muted-foreground">
                      <strong>Notes:</strong> {verificationStatus.verification.notes}
                    </p>
                  )}
                </>
              )}
              
              {verificationStatus?.verification?.status === 'pending' && (
                <p className="text-muted-foreground">
                  We will review your documents within 24-48 hours and notify you of the verification status.
                </p>
              )}
            </div>
          </div>
        </div>
        {verificationStatus?.verification?.status === 'rejected' && (
                <div className="pt-5 w-full">
                  <Button onClick={onResubmit} className="w-full">
                    Resubmit Verification
                  </Button>
                </div>
              )}
      </CardContent>
    </Card>
  )
}
