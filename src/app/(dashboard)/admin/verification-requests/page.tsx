"use client"

import { useVerificationRequests } from "@/hooks/verification-requests"
import VerificationRequestsSkeleton from "@/components/verification-requests/VerificationRequestsSkeleton"
import { VerificationRequestsHeader } from "@/components/verification-requests"
import VerificationRequestsTable from "@/components/verification-requests/VerificationRequestsTable"
import { Card, CardContent } from "@/components/ui/card"
import VerificationRequestsPagination from "@/components/verification-requests/VerificationRequestsPagination"
import VerificationRequestsStats from "@/components/verification-requests/VerificationRequestsStats"
import { useEffect, useRef } from "react"

const VerificationInbox = () => {
  const {
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    currentPage,
    pagination,
    handlePageChange,
    overallStats,
    statsLoading,
  } = useVerificationRequests()
  
  const scrollPositionRef = useRef<number>(0)
  const prevLoadingRef = useRef<boolean>(false)

  // Capture scroll position when loading starts
  useEffect(() => {
    if (loading && !prevLoadingRef.current) {
      // Loading just started - capture current scroll position
      scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop
    }
    prevLoadingRef.current = loading
  }, [loading])

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && scrollPositionRef.current > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant'
        })
        scrollPositionRef.current = 0 // Reset after restoring
      })
    }
  }, [loading, filteredRequests])


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Verification Requests</h2>
        <p className="text-muted-foreground text-pretty">Review and process all verification requests in the system</p>
      </div>

      <VerificationRequestsStats
        overallStats={overallStats}
        loading={statsLoading}
      />
      
      <Card>
        <CardContent>
          <div className="flex-1 min-h-0 flex flex-col">

            <VerificationRequestsHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            {loading ? (
              <VerificationRequestsSkeleton />
            ) : (
              <VerificationRequestsTable requests={filteredRequests} />
            )}

            {/* Pagination */}
            {pagination && (
              <div className="px-6 py-4">
                <VerificationRequestsPagination
                  page={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerificationInbox
