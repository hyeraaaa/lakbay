"use client"

import { useVerificationRequests } from "@/hooks/verification-requests"
import VerificationRequestsSkeleton from "@/components/verification-requests/VerificationRequestsSkeleton"
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
      </div>
    </div>
  )
}

export default VerificationInbox
