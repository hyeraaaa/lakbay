"use client"

import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { ChevronFirstIcon, ChevronLeftIcon, ChevronRightIcon, ChevronLastIcon } from 'lucide-react'

type UsersPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  loading: boolean
  onPageChange: (page: number) => void
}

export function UsersPagination({
  page,
  totalPages,
  totalItems,
  limit,
  loading,
  onPageChange,
}: UsersPaginationProps) {
  const startRange = Math.min((page - 1) * limit + 1, Math.max(totalItems, 0))
  const endRange = Math.min(page * limit, Math.max(totalItems, 0))

  return (
    <div className="flex items-center justify-between gap-8">
      <div />
      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
        <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
          <span className="text-foreground">{startRange}</span>
          {'-'}
          <span className="text-foreground">{endRange}</span>
          {' '}
          of{' '}
          <span className="text-foreground">{totalItems}</span>{' '}
          users
        </p>
      </div>
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onPageChange(1)}
                disabled={page === 1 || loading}
                aria-label="Go to first page"
              >
                <ChevronFirstIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                aria-label="Go to next page"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages || loading}
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

