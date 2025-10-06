"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, FileText, Shield, RotateCcw, Loader2 } from "lucide-react"
import type { IDType } from "@/hooks/account-verification/useVerification"
import { ID_TYPES } from "./id-type-selector"
import Image from "next/image"
import { useState } from "react"

interface VerificationReviewProps {
  selectedIdType: IDType
  frontImage: string
  backImage: string
  onSelectIdType: (value: IDType) => void
  onRetakePhoto: (side: "front" | "back") => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export const VerificationReview = ({
  selectedIdType,
  frontImage,
  backImage,
  onSelectIdType,
  onRetakePhoto,
  onSubmit,
  isSubmitting = false,
}: VerificationReviewProps) => {
  const [internalState] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Check className="h-5 w-5 mr-2" />
          Review & Submit
        </CardTitle>
        <CardDescription>Please review your captured images before submitting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-foreground mr-2" />
              <div className="text-sm">
                <p className="font-medium">Selected ID Type:</p>
                <p className="text-muted-foreground">{ID_TYPES.find((t) => t.value === selectedIdType)?.label}</p>
              </div>
            </div>
            <Select value={selectedIdType} onValueChange={(value: IDType) => onSelectIdType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ID_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-medium mb-2">Front of ID</h4>
            <div className="relative w-full h-64 md:h-72">
              <Image
                src={frontImage || "/placeholder.svg"}
                alt="Front of ID"
                fill
                className="object-contain rounded-lg border"
                style={{ transform: "scaleX(-1)" }}
                unoptimized
              />
            </div>
            <Button onClick={() => onRetakePhoto("front")} variant="outline" size="sm" className="mt-2 w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Front
            </Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Back of ID</h4>
            <div className="relative w-full h-64 md:h-72">
              <Image
                src={backImage || "/placeholder.svg"}
                alt="Back of ID"
                fill
                className="object-contain rounded-lg border"
                style={{ transform: "scaleX(-1)" }}
                unoptimized
              />
            </div>
            <Button onClick={() => onRetakePhoto("back")} variant="outline" size="sm" className="mt-2 w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Back
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-foreground mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Privacy & Security</p>
              <p className="text-muted-foreground">
                Your documents are encrypted and securely processed. We only use this information for identity
                verification and will never share it with third parties.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={onSubmit} className="w-full" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
