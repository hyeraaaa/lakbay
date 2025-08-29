// services/profileService.ts
import { getAccessToken } from '@/lib/jwt'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

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

export const profileService = {
  getProfile: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
    })
    const result: UserProfileResponse = await response.json()
    return { ok: response.ok, data: result }
  },

  updateProfile: async (userId: string, data: ProfileFormData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    return { ok: response.ok, data: result }
  },

  uploadProfilePicture: async (userId: string, file: File, token: string) => {
    const form = new FormData()
    form.append("profile_picture", file)

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-picture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const result = await response.json().catch(() => ({}))
    return { ok: response.ok, data: result }
  },
}
