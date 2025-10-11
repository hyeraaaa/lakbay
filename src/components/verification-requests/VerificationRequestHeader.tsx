"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileImageUrl } from "@/lib/imageUtils"

interface VerificationRequestHeaderProps {
  user?: {
    name: string
    profile_picture?: string | null
  }
  user_id: string
  doc_type: string
  submitted_at: string
  getImageSrc: (path?: string | null) => string | null
}

export default function VerificationRequestHeader({
  user,
  user_id,
  doc_type,
  submitted_at,
  getImageSrc,
}: VerificationRequestHeaderProps) {
  const displayName = doc_type === "payout_failed" 
    ? `Owner ${user_id}` 
    : user?.name || `User ${user_id}`
  const initials = doc_type === "payout_failed" 
    ? "O" 
    : (user?.name?.trim().charAt(0).toUpperCase() || user_id.charAt(0).toUpperCase())
  return (
    <header className="bg-white px-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/verification-requests">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getProfileImageUrl(user?.profile_picture) || getImageSrc(user?.profile_picture) || "/profile-avatar.png"} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-base font-medium text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500">
              {doc_type === "vehicle_registration" 
                ? "Vehicle Registration Request" 
                : "Verification Request"}
            </p>
          </div>
          <div className="ml-auto text-sm text-gray-500">{new Date(submitted_at).toLocaleDateString()}</div>
        </div>
      </div>
    </header>
  )
}
