"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  page: number
  totalPages: number
  goToPage: (page: number) => void
}

export const PaginationControls: React.FC<Props> = ({ page, totalPages, goToPage }) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className="h-10 px-3 border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((pageNum, index) =>
          pageNum === "..." ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              onClick={() => goToPage(pageNum as number)}
              className={`w-10 h-10 ${
                page === pageNum
                  ? "bg-accent text-accent-foreground"
                  : "border-border/50 hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {pageNum}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        className="h-10 px-3 border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

export default PaginationControls
