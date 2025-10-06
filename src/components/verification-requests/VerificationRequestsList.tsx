"use client"

import { useEffect, useState } from "react"
import VerificationRequestItem from "./VerificationRequestItem"

interface VerificationRequest {
  verification_id: string
  user_id: string
  user?: {
    name: string
  }
  doc_type: string
  status: string
  submitted_at: string
}

interface VerificationRequestsListProps {
  filteredRequests: VerificationRequest[]
  selectedItems: Set<string>
  toggleSelection: (id: string) => void
}

export default function VerificationRequestsList({
  filteredRequests,
  selectedItems,
  toggleSelection,
}: VerificationRequestsListProps) {
  const [readItems, setReadItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem("verification_read_ids")
      if (saved) {
        const arr = JSON.parse(saved) as string[]
        setReadItems(new Set(arr))
      }
    } catch {}
  }, [])

  const markAsRead = (id: string) => {
    setReadItems((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem("verification_read_ids", JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-auto">
      <div>
        {filteredRequests.map((request, index) => {
          const key = request.verification_id && request.verification_id.trim() !== ""
            ? request.verification_id
            : `req-${request.user_id}-${request.doc_type}-${request.submitted_at}-${index}`
          return (
            <VerificationRequestItem
              key={key}
              request={request}
              isRead={readItems.has(request.verification_id)}
              isSelected={selectedItems.has(request.verification_id)}
              onMarkAsRead={markAsRead}
              onToggleSelection={toggleSelection}
              formatDate={formatDate}
            />
          )
        })}
      </div>
    </div>
  )
}
