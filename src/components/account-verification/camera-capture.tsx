"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, RotateCcw } from "lucide-react"
import { useCamera } from "@/hooks/account-verification/useCamera"
import type { CaptureStep, IDType } from "@/hooks/account-verification/useVerification"
import { ID_TYPES } from "@/components/account-verification/id-type-selector"

interface CameraCaptureProps {
  selectedIdType: IDType
  currentStep: CaptureStep
  capturedImage?: string
  onImageCaptured: (imageData: string) => void
  onRetakePhoto: (side: "front" | "back") => void
  onContinue?: () => void
}

export const CameraCapture = ({
  selectedIdType,
  currentStep,
  capturedImage,
  onImageCaptured,
  onRetakePhoto,
  onContinue,
}: CameraCaptureProps) => {
  const { stream, isCapturing, videoRef, canvasRef, startCamera, stopCamera, captureImage } = useCamera()

  const handleCapture = () => {
    const imageData = captureImage()
    if (imageData) {
      onImageCaptured(imageData)
    }
  }

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((err) => {
        console.error("[v0] Error auto-playing video:", err)
      })
    }
  }, [stream])

  if (currentStep === "complete") return null

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Step {currentStep === "front" ? "2" : "3"}: Capture {currentStep === "front" ? "Front" : "Back"} of ID
          </CardTitle>
          <CardDescription>
            {currentStep === "front"
              ? "Position the front of your ID within the frame and capture"
              : "Now capture the back of your ID document"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isCapturing && !capturedImage && (
              <div className="text-center">
                <div className="border-2 border-dashed border-border rounded-lg p-8 mb-4">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Ready to capture the {currentStep} of your {ID_TYPES.find((t) => t.value === selectedIdType)?.label}
                  </p>
                  <Button onClick={startCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              </div>
            )}

            {isCapturing && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 border-foreground transform"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute inset-4 border-2 border-foreground border-dashed rounded-lg pointer-events-none" />
                <div className="flex justify-center mt-4 space-x-4">
                  <Button onClick={handleCapture} size="lg">
                    <Camera className="h-5 w-5 mr-2" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="text-center">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt={`${currentStep} of ID`}
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-foreground mb-4"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => onRetakePhoto(currentStep)} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  {currentStep === "front" && onContinue && <Button onClick={onContinue}>Continue to Back</Button>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}
