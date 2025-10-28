"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { authService } from "@/services/authServices"
import { getCurrentUser } from "@/lib/jwt"
import { useNotification } from "@/components/NotificationProvider"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

export function DeactivateAccountCard() {
  const [password, setPassword] = useState("")
  const [reason, setReason] = useState("")
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { success, error } = useNotification()
  const user = getCurrentUser()

  const handleDeactivate = async () => {
    if (!password.trim()) {
      error("Please enter your password to confirm deactivation")
      return
    }

    setIsDeactivating(true)
    try {
      const result = await authService.deactivateAccount(
        user?.id || "",
        password,
        reason.trim() || undefined
      )

      if (result.ok) {
        success("Account deactivated successfully. You will be logged out.")
        // Clear local storage and redirect to login
        localStorage.clear()
        sessionStorage.clear()
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        error(result.message || "Failed to deactivate account")
      }
    } catch (err) {
      error("An error occurred while deactivating your account")
    } finally {
      setIsDeactivating(false)
      setConfirmOpen(false)
    }
  }

  const handleConfirm = () => {
    setConfirmOpen(true)
  }

  return (
    <>
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Deactivate Account
          </CardTitle>
          <CardDescription>
            Permanently deactivate your account. This action cannot be undone and you will lose access to all your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deactivate-password">Current Password *</Label>
            <Input
              id="deactivate-password"
              type="password"
              placeholder="Enter your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isDeactivating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deactivate-reason">Reason for deactivation (optional)</Label>
            <Textarea
              id="deactivate-reason"
              placeholder="Please let us know why you're deactivating your account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDeactivating}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">What happens when you deactivate:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your account will be immediately deactivated</li>
              <li>• You will be logged out and unable to sign in</li>
              <li>• All your bookings will be cancelled</li>
              <li>• Your vehicles will be removed from the platform</li>
              <li>• You can reactivate your account by logging in and entering the verification code sent to your email</li>
            </ul>
          </div>

          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={isDeactivating || !password.trim()}
            className="w-full"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate Account"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Account Deactivation"
        description={
          <div className="space-y-3">
            <p className="text-red-600 font-medium">
              Are you sure you want to deactivate your account? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600">
              You will lose access to all your data, bookings, and vehicles. You can reactivate your account by logging in and entering the verification code sent to your email.
            </p>
          </div>
        }
        confirmText="Yes, Deactivate"
        variant="destructive"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}





