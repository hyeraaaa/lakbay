"use client"

import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { ChevronFirstIcon, ChevronLeftIcon, ChevronRightIcon, ChevronLastIcon } from "lucide-react"

type VerificationRequestsPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  loading?: boolean
  onPageChange: (page: number) => void
}

export default function VerificationRequestsPagination({
  page,
  totalPages,
  totalItems,
  limit,
  loading = false,
  onPageChange,
}: VerificationRequestsPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div />
      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
        <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
          <span className="text-foreground">
            {totalItems > 0
              ? `${Math.min((page - 1) * limit + 1, totalItems)}-${Math.min(page * limit, totalItems)}`
              : "0-0"}
          </span>{" "}
          of <span className="text-foreground">{totalItems}</span> requests
        </p>
      </div>
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || loading}
                aria-label="Go to first page"
              >
                <ChevronFirstIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page <= 1 || loading}
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                disabled={page >= totalPages || loading}
                aria-label="Go to next page"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages || loading}
                aria-label="Go to last page"
              >
                <ChevronLastIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}




