"use client"

import { useVerificationRequests } from "@/hooks/verification-requests"
import VerificationRequestsSkeleton from "@/components/verification-requests/VerificationRequestsSkeleton"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  VerificationRequestsHeader,
  VerificationRequestsList,
} from "@/components/verification-requests"

const VerificationInbox = () => {
  const {
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    pagination,
    handlePageChange,
  } = useVerificationRequests()
  
  const pageSize = 20


  if (loading) {
    return <VerificationRequestsSkeleton />
  }

  return (
    <div className="flex bg-white border border-neutral-200 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] h-[calc(100vh-7rem)]">
      <div className="flex-1 min-h-0 flex flex-col">
        <VerificationRequestsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setStatusFilter={setStatusFilter}
        />
        
        <VerificationRequestsList
          filteredRequests={filteredRequests}
        />

        {/* Pagination */}
        {pagination && pagination.total > pageSize && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-8">
              <div />
              <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                  <span className="text-foreground">
                    {pagination.total > 0 
                      ? `${Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)}-${Math.min(currentPage * pagination.limit, pagination.total)}`
                      : '0-0'
                    }
                  </span>{" "}
                  of <span className="text-foreground">{pagination.total}</span> requests
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
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage <= 1}
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
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage <= 1}
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
                        onClick={() => handlePageChange(Math.min(currentPage + 1, pagination.totalPages))}
                        disabled={currentPage >= pagination.totalPages}
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
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={currentPage >= pagination.totalPages}
                        aria-label="Go to last page"
                      >
                        <ChevronLastIcon size={16} aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationInbox
