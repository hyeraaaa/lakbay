"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { getAccessToken } from "@/lib/jwt"
import { profileService } from "@/services/profileServices"

export interface UserProfileResponse {
  user_id: number
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  user_type: string
  is_verified: boolean
  profile_picture?: string | null
}

export interface ProfileFormData {
  first_name: string
  last_name: string
  username: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const initialFormData: ProfileFormData = {
  first_name: "",
  last_name: "",
  username: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
}

export function useUserProfile() {
  const { user, updateUser, isLoading: authLoading } = useJWT()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)

  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000', [])

  const shouldShowSkeleton = authLoading || isLoading

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      setIsLoading(true)
      setError("")
      try {
        const { ok, data } = await profileService.getProfile(user.id)
        
        if (!ok) {
          throw new Error("Failed to load profile")
        }

        setProfileData(data)
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          username: data.username || "",
          phone: data.phone || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          postal_code: data.postal_code || "",
          country: data.country || "",
        })
      } catch (err: any) {
        setError(err?.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      // Use the service instead of direct API call
      const { ok, data } = await profileService.updateProfile(user.id, formData)

      if (!ok) {
        throw new Error(data?.message || "Failed to update profile")
      }

      if (selectedFile) {
        const accessToken = getAccessToken()
        if (!accessToken) throw new Error("No access token available")

        // Use the service instead of direct fetch
        const { ok: uploadOk, data: uploadData } = await profileService.uploadProfilePicture(
          user.id, 
          selectedFile, 
          accessToken
        )

        if (!uploadOk) {
          throw new Error(uploadData?.message || "Failed to upload profile picture")
        }
      }

      setSuccess(selectedFile ? "Profile and photo updated successfully" : "Profile updated successfully")

      // Refresh profile data using the service
      const { ok: refreshOk, data: refreshedData } = await profileService.getProfile(user.id)
      if (refreshOk) {
        setProfileData(refreshedData)
        setSelectedFile(null)
        setIsEditMode(false)
        updateUser({
          first_name: refreshedData.first_name,
          last_name: refreshedData.last_name,
          user_type: refreshedData.user_type,
          is_verified: refreshedData.is_verified,
          email: refreshedData.email,
          id: String(refreshedData.user_id),
        })
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : "")
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const computedAvatarSrc = useMemo(() => {
    if (!profileData?.profile_picture) return ""
    const raw = profileData.profile_picture
    if (/^https?:\/\//i.test(raw)) return raw
    const normalized = raw.startsWith('/') ? raw.slice(1) : raw
    return `${API_BASE_URL}/${normalized}`.replace(/\\/g, "/")
  }, [API_BASE_URL, profileData?.profile_picture])

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setSelectedFile(null)
    setPreviewUrl("")
    if (profileData) {
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        username: profileData.username || "",
        phone: profileData.phone || "",
        address_line1: profileData.address_line1 || "",
        address_line2: profileData.address_line2 || "",
        city: profileData.city || "",
        state: profileData.state || "",
        postal_code: profileData.postal_code || "",
        country: profileData.country || "",
      })
    }
  }

  return {
    user,
    authLoading,
    isLoading,
    isSaving,
    error,
    success,
    formData,
    profileData,
    selectedFile,
    previewUrl,
    isEditMode,
    fileInputRef,
    shouldShowSkeleton,
    computedAvatarSrc,
    handleInputChange,
    handleSubmit,
    handleFileChange,
    handleCancelEdit,
    setIsEditMode,
    setError,
    setSuccess,
  }
}
