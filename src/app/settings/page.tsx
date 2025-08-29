"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Settings, User, Lock } from "lucide-react"
import AnimatedAlert from "@/components/ui/AnimatedAlert"
import { AuthenticatedRoute } from "@/components/auth/ProtectedRoute"
import { useAccountSettings } from "@/hooks/settings/useAccountSettings"

const SettingsPage = () => {
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
    error,
    success,
    setError,
    setSuccess,
    handleEmailUpdate,
    handlePasswordUpdate,
  } = useAccountSettings()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthenticatedRoute>
      <div className="bg-background p-4">
        {error && (
          <AnimatedAlert
            message={error}
            variant="destructive"
            position="bottom-right"
            onClose={() => setError("")}
          />
        )}
        {success && (
          <AnimatedAlert
            message={success}
            variant="default"
            position="bottom-right"
            onClose={() => setSuccess("")}
          />
        )}

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          {/* Email Settings */}
          <Card className="py-5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Email Address</CardTitle>
              </div>
              <CardDescription>
                Update your email address for account notifications and login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your new email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="max-w-md"
                    disabled={isUpdatingEmail}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isUpdatingEmail}
                  >
                    {isUpdatingEmail ? "Updating..." : "Update Email"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="py-5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Password</CardTitle>
              </div>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative max-w-md">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                      disabled={isUpdatingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isUpdatingPassword}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative max-w-md">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      disabled={isUpdatingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isUpdatingPassword}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative max-w-md">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      disabled={isUpdatingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isUpdatingPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}

export default SettingsPage
