"use client"

import { useState, useEffect } from "react"
import { verificationService, type VerificationRequest } from "@/services/verificationServices"
import { adminReviewService, type AdminReviewItem } from "@/services/adminReviewService"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

// Extended interface to handle both verification requests and registrations
interface ExtendedRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "id_card" | "business_license" | "vehicle_registration" | "payout_failed" | "refund_request" | "reactivation_request"
  doc_url: string
  doc_urls?: string[]
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  reviewed_by_name?: string
  notes?: string
  user?: {
    name: string
    email: string
    profile_picture?: string | null
  }
  // Additional fields for vehicle registrations
  vehicle?: {
    brand: string
    model: string
    year: number
  }
  isRegistration?: boolean
}

export const useVerificationRequests = () => {
  const [requests, setRequests] = useState<ExtendedRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const pageSize = 10

  useEffect(() => {
    fetchVerificationRequests()
  }, [currentPage, statusFilter])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      const result = await adminReviewService.getAll(currentPage, pageSize, statusFilter)
      setRequests(result.items)
      setPagination(result.pagination)
    } catch (error) {
      console.error("Error fetching verification requests:", error)
      setRequests([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.vehicle && `${request.vehicle.brand} ${request.vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase()))
    // Note: Status filtering is now handled server-side, so we don't need to filter here
    return matchesSearch
  })

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    if (selectedItems.size === filteredRequests.length && filteredRequests.length > 0) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredRequests.map((r) => r.verification_id)))
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when status changes
  }

  return {
    requests,
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    selectedItems,
    toggleSelection,
    selectAll,
    refetch: fetchVerificationRequests,
    // Pagination
    currentPage,
    pagination,
    handlePageChange,
  }
}
