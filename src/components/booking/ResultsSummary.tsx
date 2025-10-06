"use client"

import type React from "react"

type ResultsSummaryProps = {
  count: number
  total: number
  page: number
  totalPages: number
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ count, total, page, totalPages }) => {
  if (total === 0) return null

  const startItem = (page - 1) * count + 1
  const endItem = Math.min(page * count, total)

  return (
    <div className="text-sm text-muted-foreground w-full text-right">
      Showing {startItem} to {endItem} of {total.toLocaleString()} results
      {totalPages > 1 && (
        <span className="ml-2">
          (Page {page} of {totalPages})
        </span>
      )}
    </div>
  )
}

export default ResultsSummary
