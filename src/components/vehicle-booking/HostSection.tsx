"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { getImageUrl } from "@/lib/imageUtils"
import { encodeId } from "@/lib/idCodec"
import { useJWT } from "@/contexts/JWTContext"
import { useRouter } from "next/navigation"
import { generalChatService } from "@/services/generalChatService"

type HostSectionProps = {
  hostFirstName?: string | null
  hostLastName?: string | null
  hostProfilePicture?: string | null
  hostUserId?: number | string | null
}

export default function HostSection({ hostFirstName, hostLastName, hostProfilePicture, hostUserId }: HostSectionProps) {
  const { user, isAuthenticated } = useJWT()
  const router = useRouter()
  const isOwnerViewingOwnListing = user?.user_type === 'owner' && String(user.id) === String(hostUserId || '')
  const isAdmin = user?.user_type === 'admin'

  const handleChatClick = async () => {
    if (!hostUserId) return
    const isSmallToMedium = typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false

    // On small to medium screens, go to the dedicated chat pages
    if (isSmallToMedium) {
      try {
        const ownerNumericId = Number(hostUserId)
        if (!Number.isFinite(ownerNumericId)) {
          router.push("/chat")
          return
        }
        const existing = await generalChatService.checkOrGetExistingSessionWithOwner(ownerNumericId)
        if (existing.ok && existing.data?.session_id) {
          router.push(`/chat/${existing.data.session_id}`)
        } else {
          // No existing session: create one by sending a friendly first message
          const created = await generalChatService.sendMessage({ message: "👋", ownerId: ownerNumericId })
          if (created.ok && created.data?.session?.session_id) {
            router.push(`/chat/${created.data.session.session_id}`)
          } else {
            router.push("/chat")
          }
        }
      } catch {
        router.push("/chat")
      }
      return
    }

    // On large screens, open the floating/general chat widget
    try {
      const event = new CustomEvent('lakbay:open-chat-with-owner', { detail: { ownerId: String(hostUserId) } })
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
        {!isOwnerViewingOwnListing && isAuthenticated && !isAdmin && (
          <Button variant="default" size="sm" className="bg-black hover:bg-gray-800" onClick={handleChatClick}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with Owner
          </Button>
        )}
      </div>
    </div>
  )
}


