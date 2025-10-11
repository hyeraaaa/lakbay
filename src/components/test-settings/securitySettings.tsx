"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { EmailSettingsCard } from "@/components/test-settings/emailSettingsCard"
import { PasswordSettingsCard } from "@/components/test-settings/passwordSettingsCard"
import { DeactivateAccountCard } from "@/components/test-settings/deactivateAccountCard"
import { useAccountSettings } from "@/hooks/settings/useAccountSettings"
import { useEffect, useState } from "react"
import { useNotification } from "@/components/NotificationProvider"

export function SecuritySettings() {
  const {
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isUpdatingEmail,
    isUpdatingPassword,
    isUpdating2FA,
    twoFactorEnabled,
    setTwoFactorEnabled,
    error,
    success,
    handleEmailUpdate,
    handlePasswordUpdate,
    handle2FAToggle,
  } = useAccountSettings()

  const { success: notifySuccess, error: notifyError } = useNotification()

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  useEffect(() => {
    if (success) {
      notifySuccess(success)
    }
  }, [success, notifySuccess])

  return (
    <div className="space-y-6">
      <EmailSettingsCard
        email={email}
        setEmail={setEmail}
        isUpdating={isUpdatingEmail}
        onSubmit={handleEmailUpdate}
      />

      <PasswordSettingsCard
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        isUpdating={isUpdatingPassword}
        onSubmit={handlePasswordUpdate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Secure your account with SMS or authenticator app verification
              </p>
              {isUpdating2FA && (
                <p className="text-sm text-blue-600">
                  Updating 2FA settings...
                </p>
              )}
            </div>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
              disabled={isUpdating2FA}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication is enabled. You&apos;ll receive a verification code when signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <DeactivateAccountCard />
    </div>
  )
}
