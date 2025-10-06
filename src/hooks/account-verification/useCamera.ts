"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export const useCamera = (onCaptureComplete?: () => void) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isCleaningUp = useRef(false)

  const startCamera = useCallback(async () => {
    // Prevent starting if already cleaning up
    if (isCleaningUp.current) {
      console.log("[v0] Camera is cleaning up, skipping start")
      return
    }

    try {
      // Stop any existing stream first
      if (stream) {
        console.log("[v0] Stopping existing stream before starting new one")
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      console.log("[v0] Camera stream obtained:", mediaStream)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            console.log("[v0] Video playing, dimensions:", videoRef.current?.videoWidth, videoRef.current?.videoHeight)
          } catch (err) {
            console.error("[v0] Error playing video:", err)
          }
        }
      }

      setIsCapturing(true)
    } catch (error) {
      console.error("[v0] Error accessing camera:", error)
      alert("Unable to access camera. Please ensure camera permissions are granted.")
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    if (isCleaningUp.current) {
      console.log("[v0] Camera already cleaning up, skipping stop")
      return
    }

    isCleaningUp.current = true
    
    try {
      if (stream) {
        console.log("[v0] Stopping camera stream")
        stream.getTracks().forEach((track) => {
          track.stop()
          console.log("[v0] Track stopped:", track.kind)
        })
        setStream(null)
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.onloadedmetadata = null
      }
      
      setIsCapturing(false)
    } catch (error) {
      console.error("[v0] Error stopping camera:", error)
    } finally {
      isCleaningUp.current = false
    }
  }, [stream])

  const captureImage = useCallback((): string | null => {
    console.log("[v0] Attempting to capture image...")
    if (!videoRef.current || !canvasRef.current) {
      console.log("[v0] Missing video or canvas ref")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.log("[v0] No canvas context")
      return null
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log(
        "[v0] Video not ready, readyState:",
        video.readyState,
        "dimensions:",
        video.videoWidth,
        video.videoHeight,
      )
      alert("Camera is still loading. Please try again in a moment.")
      return null
    }

    console.log("[v0] Video ready, dimensions:", video.videoWidth, video.videoHeight)
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    console.log("[v0] Image captured successfully")

    // Call the callback to notify that capture is complete
    // This allows the stepper to advance without waiting for camera to stop
    if (onCaptureComplete) {
      onCaptureComplete()
    }

    // Don't stop camera immediately - let the user decide when to stop
    // This prevents driver crashes from abrupt stream termination
    return imageData
  }, [onCaptureComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[v0] Component unmounting, cleaning up camera")
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return {
    stream,
    isCapturing,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureImage,
  }
}
