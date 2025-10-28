"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, Mail } from "lucide-react"
import { useNotification } from "@/components/NotificationProvider"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/auth/useAuth"

const ReactivateAccount = () => {
  const { success, error: showError } = useNotification()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [userId, setUserId] = useState("")
  const [emailMasked, setEmailMasked] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { reactivateAccount, resendReactivation, isProcessing, authError } = useAuth()

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("") // Clear error when user starts typing
    setSuccessMessage("") // Clear success message when user starts typing

    // Auto-focus next input only if there's a value and we're not on the last field
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus()
        }, 0)
      } else if (code[index]) {
        const newCode = [...code]
        newCode[index] = ""
        setCode(newCode)
        setError("")
        setSuccessMessage("")
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i]
      }
    }

    setCode(newCode)
    setError("")
    setSuccessMessage("")

    const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
    if (nextEmptyIndex !== -1) {
      setTimeout(() => {
        inputRefs.current[nextEmptyIndex]?.focus()
      }, 0)
    }
  }

  const handleVerify = async () => {
    const codeString = code.join("")

    if (codeString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    if (!userId) {
      setError("Session expired. Please try logging in again.")
      return
    }

    setError("")

    try {
      const result = await reactivateAccount(userId, codeString)
      
      if (!result.success) {
        setError(result.error || "Reactivation failed. Please try again.")
      }
      // Success is handled by the reactivateAccount function (redirects user to login)
    } catch (err) {
      setError("Reactivation failed. Please try again.")
    }
  }

  const handleResend = async () => {
    if (!userId) {
      setError("Session expired. Please try logging in again.")
      return
    }

    setIsResending(true)
    setCode(["", "", "", "", "", ""])
    setError("")
    setSuccessMessage("")
    inputRefs.current[0]?.focus()

    try {
      const result = await resendReactivation(userId)
      
      if (!result.success) {
        setError(result.error || "Failed to resend code. Please try again.")
      } else {
        setSuccessMessage("New code sent to your email")
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = sessionStorage.getItem('reactivation_userId')
      const storedEmailMasked = sessionStorage.getItem('reactivation_emailMasked')
      
      if (storedUserId) {
        setUserId(storedUserId)
      } else {
        router.push('/login')
      }
      
      if (storedEmailMasked) {
        setEmailMasked(storedEmailMasked)
      }
    }
  }, [router])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-muted p-3 rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <CardTitle>Reactivate Your Account</CardTitle>
          <CardDescription>
            Your account has been deactivated. We&apos;ve sent a verification code to {emailMasked || 'your email'}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Check your email
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code we sent to {emailMasked || 'your email'} to reactivate your account.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {code.map((digit, index) => (
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
                  "focus:border-foreground focus:ring-2 focus:ring-ring",
                  error && "border-destructive focus:border-destructive focus:ring-destructive/20",
                )}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={isProcessing || code.some((digit) => digit === "")}
            className="w-full h-11 text-base font-semibold"
          >
            {isProcessing ? "Reactivating..." : "Reactivate Account"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-medium text-foreground hover:underline transition-colors underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Login
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center text-balance">
            Enter the verification code to reactivate your account and regain access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReactivateAccount

