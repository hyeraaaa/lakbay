"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { PasswordInput } from "@/components/settings/passwordInput"

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
        <form onSubmit={onSubmit} className="space-y-4">
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

          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
