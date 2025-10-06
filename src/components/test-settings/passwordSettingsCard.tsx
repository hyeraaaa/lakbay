"use client"

import type React from "react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { PasswordInput } from "@/components/test-settings/passwordInput"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

interface PasswordSettingsCardProps {
  currentPassword: string
  setCurrentPassword: (password: string) => void
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  isUpdating: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function PasswordSettingsCard({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isUpdating,
  onSubmit,
}: PasswordSettingsCardProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const allowSubmitRef = useRef(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!allowSubmitRef.current) {
      e.preventDefault()
      const current = (currentPassword ?? "").trim()
      const next = (newPassword ?? "").trim()
      const confirmation = (confirmPassword ?? "").trim()

      if (!current || !next || !confirmation) {
        setValidationError("Please fill out all password fields.")
        return
      }

      if (next !== confirmation) {
        setValidationError("New password and confirmation do not match.")
        return
      }

      setValidationError(null)
      setConfirmOpen(true)
      return
    }
    allowSubmitRef.current = false
    onSubmit(e)
  }
  return (
    <Card className="py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>Password</CardTitle>
        </div>
        <CardDescription>Change your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          <PasswordInput
            id="current-password"
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            disabled={isUpdating}
          />

          <PasswordInput
            id="new-password"
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={setNewPassword}
            disabled={isUpdating}
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={isUpdating}
          />

          <div className="text-sm text-muted-foreground">Password must be at least 6 characters long</div>

          {validationError ? (
            <p className="text-sm text-red-500">{validationError}</p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Update password?"
          description="Make sure you remember your new password. Continue?"
          confirmText="Confirm"
          cancelText="Cancel"
          variant="default"
          onConfirm={() => {
            allowSubmitRef.current = true
            setConfirmOpen(false)
            formRef.current?.requestSubmit()
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </CardContent>
    </Card>
  )
}
