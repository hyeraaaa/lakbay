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
import VerificationRequestsTable from "@/components/verification-requests/VerificationRequestsTable"
import { Card, CardContent } from "@/components/ui/card"
import VerificationRequestsPagination from "@/components/verification-requests/VerificationRequestsPagination"
import VerificationRequestsStats from "@/components/verification-requests/VerificationRequestsStats"

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
    currentPage,
    pagination,
    handlePageChange,
  } = useVerificationRequests()
  
  const pageSize = 20


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Verification Requests</h2>
        <p className="text-muted-foreground text-pretty">Review and process all verification requests in the system</p>
      </div>

      <VerificationRequestsStats
        totalItems={pagination?.total || 0}
        requests={filteredRequests}
        loading={loading}
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
