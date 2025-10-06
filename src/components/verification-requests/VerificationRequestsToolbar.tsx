"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Archive, Trash2, Mail, Clock } from "lucide-react"

interface VerificationRequestsToolbarProps {
  selectedItems: Set<string>
  filteredRequestsLength: number
  selectAll: () => void
}

export default function VerificationRequestsToolbar({
  selectedItems,
  filteredRequestsLength,
  selectAll,
}: VerificationRequestsToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-2">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={selectedItems.size === filteredRequestsLength && filteredRequestsLength > 0}
          onCheckedChange={selectAll}
        />
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
