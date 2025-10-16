"use client"
import { Mail, Phone, Share2 } from "lucide-react"

export default function ShareActions() {
  return (
    <div className="mt-2">
      <div className="text-xs font-semibold text-muted-foreground mb-3">Share this Profile</div>
      <div className="flex items-center gap-4 text-foreground">
        <a role="button" className="p-2 rounded-full border hover:bg-accent" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
