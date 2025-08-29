"use client"

import { useState } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { authService } from "@/services/authServices"

export function useAccountSettings() {
  const { user, logout } = useJWT()

  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

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
    } catch (err: any) {
      setError(err?.message || "Failed to update email. Please try again.")
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
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.")
    } finally {
      setIsUpdatingPassword(false)
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
    error,
    success,
    setError,
    setSuccess,
    handleEmailUpdate,
    handlePasswordUpdate,
  }
}
