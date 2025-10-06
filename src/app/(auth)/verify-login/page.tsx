"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useNotification } from "@/components/NotificationProvider"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/auth/useAuth"

const OtpVerification = () => {
  const { success, error: showError } = useNotification()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState("")
  const [rememberDevice, setRememberDevice] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { verify2FA, resend2FA, isProcessing, authError, checkDeviceRemembered } = useAuth()

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("") // Clear error when user starts typing
    setSuccessMessage("") // Clear success message when user starts typing

    // Auto-focus next input only if there's a value and we're not on the last field
    if (value && index < 5) {
      // Use setTimeout to ensure the state update has completed
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 0)
    }
    // If we're on the last field (index 5) and it has a value, don't auto-focus anywhere
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current field is empty, go to previous field
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus()
        }, 0)
      } else if (otp[index]) {
        // If current field has value, clear it and stay in current field
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        setError("")
        setSuccessMessage("")
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)
    setError("")
    setSuccessMessage("")

    // Focus the next empty input, or stay on current field if all are filled
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "")
    if (nextEmptyIndex !== -1) {
      // There's an empty field, focus it
      setTimeout(() => {
        inputRefs.current[nextEmptyIndex]?.focus()
      }, 0)
    }
    // If all fields are filled (nextEmptyIndex === -1), don't change focus
  }

  const handleVerify = async () => {
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    if (!email) {
      setError("Email not found. Please try logging in again.")
      return
    }

    setError("")

    try {
      const result = await verify2FA(email, otpString, rememberDevice)
      
      if (!result.success) {
        setError(result.error || "Verification failed. Please try again.")
      }
      // Success is handled by the verify2FA function (redirects user)
    } catch (err) {
      setError("Verification failed. Please try again.")
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Email not found. Please try logging in again.")
      return
    }

    setIsResending(true)
    setOtp(["", "", "", "", "", ""])
    setError("")
    setSuccessMessage("")
    inputRefs.current[0]?.focus()

    try {
      const result = await resend2FA(email)
      
      if (!result.success) {
        setError(result.error || "Failed to resend code. Please try again.")
      } else {
        // Show success message
        setSuccessMessage("New code sent to your email")
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  // Load email from sessionStorage on component mount and check if device is remembered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('2fa_email')
      if (storedEmail) {
        setEmail(storedEmail)
        
        // Check if device is already remembered
        if (checkDeviceRemembered(storedEmail)) {
          // Device is remembered, skip OTP and proceed with login
          // This is now handled in the backend during login
        }
      } else {
        // If no email found, redirect to login
        router.push('/login')
      }
    }
  }, [router, checkDeviceRemembered])

  // Focus first input only on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Update error state when authError changes
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Show notifications when error or successMessage changes
  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  useEffect(() => {
    if (successMessage) {
      success(successMessage)
    }
  }, [successMessage, success])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-balance">Enter OTP Code</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to {email ? `${email}` : 'your email'}. Please enter it below to continue.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                "w-12 h-12 text-center text-lg font-semibold",
                "border-2 rounded-lg transition-colors",
                "focus:border-accent focus:ring-2 focus:ring-accent/20",
                error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>


        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-device"
            checked={rememberDevice}
            onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
          />
          <label
            htmlFor="remember-device"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember this device for 7 days
          </label>
        </div>

        <Button
          onClick={handleVerify}
          disabled={isProcessing || otp.some((digit) => digit === "")}
          className="w-full h-11 text-base font-semibold"
        >
          {isProcessing ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center text-balance">
          Your data is secure and encrypted. We never share your personal information.
        </p>
      </div>
    </div>
  )
  }

export default OtpVerification;
