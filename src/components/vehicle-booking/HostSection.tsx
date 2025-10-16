"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, MessageCircle } from "lucide-react"
import { getImageUrl } from "@/lib/imageUtils"
import { encodeId } from "@/lib/idCodec"
import { useJWT } from "@/contexts/JWTContext"

type HostSectionProps = {
  hostFirstName?: string | null
  hostLastName?: string | null
  hostProfilePicture?: string | null
  hostUserId?: number | string | null
}

export default function HostSection({ hostFirstName, hostLastName, hostProfilePicture, hostUserId }: HostSectionProps) {
  const { user } = useJWT()
  const isOwnerViewingOwnListing = user?.user_type === 'owner' && String(user.id) === String(hostUserId || '')

  const handleChatClick = () => {
    if (!hostUserId) return
    try {
      const event = new CustomEvent('lakbay:open-chat-with-owner', {
        detail: { ownerId: String(hostUserId) },
      })
      window.dispatchEvent(event)
    } catch {}
  }
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Hosted by</h3>
      <div className="flex items-center gap-4 border-b border-neutral-300 pb-8">
        <Link href={hostUserId ? `/profile/${encodeId(String(hostUserId))}` : "#"} className="flex items-center gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={hostProfilePicture ? getImageUrl(hostProfilePicture) : "/placeholder.svg"} />
            <AvatarFallback>{(hostFirstName || "").charAt(0) || "H"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="font-semibold text-lg">{hostFirstName && hostLastName ? `${hostFirstName} ${hostLastName}` : "Host"}</span>
          </div>
        </Link>
        {!isOwnerViewingOwnListing && (
          <Button variant="default" size="sm" className="bg-black hover:bg-gray-800" onClick={handleChatClick}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with Owner
          </Button>
        )}
      </div>
    </div>
  )
}


