import { useEffect, useState } from 'react'
import { profileService, type UserProfileResponse } from '@/services/profileServices'

export function usePublicProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        if (!userId) return
        const { ok, data } = await profileService.getPublicProfile(userId)
        if (active) setProfile(ok ? data : null)
      } catch {
        if (active) setProfile(null)
      } finally {
        if (active) setIsLoadingProfile(false)
      }
    }
    setIsLoadingProfile(true)
    setProfile(null)
    run()
    return () => { active = false }
  }, [userId])

  return { profile, isLoadingProfile }
}

 