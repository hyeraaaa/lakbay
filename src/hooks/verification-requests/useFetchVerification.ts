"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const pageSize = 20

  // Reset to page 1 when search query changes (but don't refetch immediately)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchVerificationRequests()
  }, [statusFilter, currentPage])

  const fetchVerificationRequests = useCallback(async () => {
    try {
      setLoading(true)
      // Use server-side pagination with status filter
      const result = await adminReviewService.getAll(
        currentPage, 
        pageSize, 
        statusFilter === "all" ? undefined : statusFilter
      )
      
      setRequests(result.items)
      
      // Update pagination from server response
      if (result.pagination) {
        setPagination(result.pagination)
      } else {
        // Fallback pagination calculation if server doesn't return it
        setPagination({
          page: currentPage,
          limit: pageSize,
          total: result.items.length,
          totalPages: Math.ceil(result.items.length / pageSize)
        })
      }
      
    } catch (error) {
      setRequests([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when status changes
  }

  // Client-side search filtering (only on current page results for efficiency)
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      request.user?.name?.toLowerCase().includes(query) ||
      request.user?.email?.toLowerCase().includes(query) ||
      request.user_id.toLowerCase().includes(query) ||
      (request.vehicle && `${request.vehicle.brand} ${request.vehicle.model}`.toLowerCase().includes(query))
    )
  })

  // Ensure we never exceed the page size limit
  const getPaginatedFilteredRequests = () => {
    return filteredRequests.slice(0, pageSize)
  }

  return {
    requests,
    filteredRequests: getPaginatedFilteredRequests(),
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    refetch: fetchVerificationRequests,
    // Pagination
    currentPage,
    pagination,
    handlePageChange,
  }
}
