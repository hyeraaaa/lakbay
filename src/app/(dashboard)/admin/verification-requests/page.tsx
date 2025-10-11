"use client"

import { useVerificationRequests } from "@/hooks/verification-requests"
import VerificationRequestsSkeleton from "@/components/verification-requests/VerificationRequestsSkeleton"
import PaginationControls from "@/components/booking/PaginationControls"
import {
  VerificationRequestsHeader,
  VerificationRequestsToolbar,
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
    selectedItems,
    toggleSelection,
    selectAll,
    currentPage,
    pagination,
    handlePageChange,
  } = useVerificationRequests()

  if (loading) {
    return <VerificationRequestsSkeleton />
  }

  return (
    <div className="flex bg-background">
      <div className="flex-1 min-h-0 flex flex-col">
        <VerificationRequestsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setStatusFilter={setStatusFilter}
        />
        
        <VerificationRequestsToolbar
          selectedItems={selectedItems}
          filteredRequestsLength={filteredRequests.length}
          selectAll={selectAll}
        />
        
        <VerificationRequestsList
          filteredRequests={filteredRequests}
          selectedItems={selectedItems}
          toggleSelection={toggleSelection}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} requests
              </div>
              <PaginationControls
                page={currentPage}
                totalPages={pagination.totalPages}
                goToPage={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationInbox
