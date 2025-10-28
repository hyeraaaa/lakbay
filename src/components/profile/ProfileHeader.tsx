"use client"
import { useMemo, useState } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { Button } from "@/components/ui/button"
import { MessageCircle, Flag } from "lucide-react"
import { getImageUrl } from "@/lib/imageUtils"
import type { UserProfileResponse } from "@/services/profileServices"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReportDialog from "./ReportDialog"

type Props = {
  profile: UserProfileResponse | null
  userId: string
}

export default function ProfileHeader({ profile, userId }: Props) {
  const { user, isAuthenticated } = useJWT()
  const [showReportDialog, setShowReportDialog] = useState(false)
  
  const fullName = useMemo(() => {
    if (!profile) return "Profile"
    const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    return name || profile.username || "Profile"
  }, [profile])

  const avatarSrc = useMemo(() => getImageUrl(profile?.profile_picture || ""), [profile?.profile_picture])

  const initials = useMemo(() => {
    const name = fullName || profile?.username || "User"
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ""
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : ""
    return (first + second).toUpperCase() || "U"
  }, [fullName, profile?.username])

  const handleChatClick = () => {
    if (!userId) return
    try {
      const event = new CustomEvent('lakbay:open-chat-with-owner', {
        detail: { ownerId: String(userId) },
      })
      window.dispatchEvent(event)
    } catch {}
  }

  const handleReportClick = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      return
    }
    setShowReportDialog(true)
  }

  const userName = fullName || profile?.username || "User"

  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={avatarSrc || undefined} alt="Profile" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">{fullName || "User"}</h1>
          {String(user?.id ?? "") !== String(userId) && isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800" onClick={handleChatClick}>
                <MessageCircle className="h-4 w-4" />
                Chat with Owner
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleReportClick}
              >
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{profile?.username ? `@${profile.username}` : ""}</p>
      </div>

      <ReportDialog
        userId={userId}
        userName={userName}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </>
  )
}
