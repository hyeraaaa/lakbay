"use client"
import Link from 'next/link'
import { useMemo } from 'react'
import { useJWT } from '@/contexts/JWTContext'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUtils'
import type { UserProfileResponse } from '@/services/profileServices'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Props = {
  profile: UserProfileResponse | null
  userId: string
}

export default function ProfileHeader({ profile, userId }: Props) {
  const { user } = useJWT()
  const fullName = useMemo(() => {
    if (!profile) return 'Profile'
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    return name || profile.username || 'Profile'
  }, [profile])

  const avatarSrc = useMemo(() => getImageUrl(profile?.profile_picture || ''), [profile?.profile_picture])

  const initials = useMemo(() => {
    const name = fullName || profile?.username || 'User'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return (first + second).toUpperCase() || 'U'
  }, [fullName, profile?.username])

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={avatarSrc || undefined} alt="Profile" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">{fullName || 'User'}</h1>
        {String(user?.id ?? '') !== String(userId) && (
          <Link href={`/?openChat=true&userId=${userId}`}>
            <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
              <MessageCircle className="h-4 w-4" />
              Chat with Owner
            </Button>
          </Link>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{profile?.username ? `@${profile.username}` : ''}</p>
    </div>
  )
}


