"use client"

import { useState, useEffect } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { authService } from "@/services/authServices"

export function useAccountSettings() {
  const { user, logout, updateUser } = useJWT()

  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdating2FA, setIsUpdating2FA] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_fa_enabled ?? false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Sync 2FA state with user data
  useEffect(() => {
    if (user?.two_fa_enabled !== undefined) {
      setTwoFactorEnabled(user.two_fa_enabled)
    }
  }, [user?.two_fa_enabled])

  // Update email
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError("Please enter a valid email address.")
    if (!user?.id) return setError("User not found. Please log in again.")

    setIsUpdatingEmail(true)
    setError("")
    setSuccess("")
    try {
      const response = await authService.updateEmail(user.id, { email })

      if (!response.ok) throw new Error(response.data?.message || "Failed to update email.")

      setSuccess("Your email address has been successfully updated. You will be logged out shortly.")
      setEmail("")
      setTimeout(() => logout(), 4000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update email. Please try again."
      setError(errorMessage)
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Update password
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) return setError("Please fill in all password fields.")
    if (newPassword !== confirmPassword) return setError("New passwords do not match.")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters long.")
    if (!user?.id) return setError("User not found. Please log in again.")

    setIsUpdatingPassword(true)
    setError("")
    setSuccess("")
    try {
      const response = await authService.updatePassword(user.id, {
        current_password: currentPassword,
        new_password: newPassword,
      })

      if (!response.ok) throw new Error(response.data?.message || "Failed to update password.")

      setSuccess("Your password has been successfully updated.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password. Please try again."
      setError(errorMessage)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Toggle 2FA
  const handle2FAToggle = async () => {
    setIsUpdating2FA(true)
    setError("")
    setSuccess("")
    try {
      const newState = !twoFactorEnabled
      const response = await authService.toggle2FA(newState)

      if (!response.ok) throw new Error(response.data?.message || "Failed to toggle 2FA.")

      // Update state based on the intended new state since server doesn't return current state
      setTwoFactorEnabled(newState)
      // Update user context with new 2FA state
      updateUser({ two_fa_enabled: newState })
      setSuccess(newState ? "Two-factor authentication has been enabled." : "Two-factor authentication has been disabled.")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle 2FA. Please try again."
      setError(errorMessage)
    } finally {
      setIsUpdating2FA(false)
    }
  }

  return {
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
    setError,
    setSuccess,
    handleEmailUpdate,
    handlePasswordUpdate,
    handle2FAToggle,
  }
}
