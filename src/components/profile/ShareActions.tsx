"use client"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

export default function ShareActions() {
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      toast.success("Profile URL copied to clipboard!")
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const currentUrl = window.location.href
      const textArea = document.createElement("textarea")
      textArea.value = currentUrl
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        toast.success("Profile URL copied to clipboard!")
      } catch (fallbackErr) {
        toast.error("Failed to copy URL. Please copy it manually.")
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  return (
    <div className="mt-2">
      <div className="text-xs font-semibold text-muted-foreground mb-3">Share this Profile</div>
      <div className="flex items-center gap-4 text-foreground">
        <button
          onClick={handleShare}
          className="p-2 rounded-full border hover:bg-accent transition-colors cursor-pointer"
          aria-label="Share"
          type="button"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
