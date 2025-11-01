"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { verificationService, type VerificationRequest } from "@/services/verificationServices"
import { adminReviewService, type AdminReviewItem } from "@/services/adminReviewService"

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type TypeFilter =
  | "all"
  | "account_verification"
  | "business_license"
  | "vehicle_registration"
  | "payout_failed"
  | "refund_request"
  | "reactivation_request"

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
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const pageSize = 20

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from URL params (once on mount)
  useEffect(() => {
    const spStatus = searchParams.get("status") as StatusFilter | null
    const spType = searchParams.get("type")
    const spPage = searchParams.get("page")
    const spSearch = searchParams.get("search")

    if (spStatus && ["all","pending","approved","rejected"].includes(spStatus)) {
      setStatusFilter(spStatus)
    }

    // Map backend type values to our TypeFilter
    const backendToUiType = (t: string | null): TypeFilter => {
      switch ((t || "").toLowerCase()) {
        case "verification":
          return "account_verification"
        case "registration":
          return "vehicle_registration"
        case "owner_enrollment":
        case "owner-enrollment":
        case "owner":
          return "business_license"
        case "payouts":
        case "failed_payouts":
          return "payout_failed"
        case "refunds":
        case "refund":
          return "refund_request"
        case "reactivation_requests":
        case "reactivation":
          return "reactivation_request"
        case "all":
          return "all"
        default:
          return "all"
      }
    }

    if (spType) {
      setTypeFilter(backendToUiType(spType))
    }

    if (spPage) {
      const n = Number(spPage)
      if (!Number.isNaN(n) && n > 0) setCurrentPage(n)
    }

    if (spSearch) setSearchQuery(spSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to page 1 when search query changes (but don't refetch immediately)
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      if (currentPage !== 1) setCurrentPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  useEffect(() => {
    fetchVerificationRequests()
  }, [statusFilter, typeFilter, currentPage, debouncedSearch])

  const fetchVerificationRequests = useCallback(async () => {
    try {
      setLoading(true)
      // Use server-side pagination with status and type filters
      const result = await adminReviewService.getAll(
        currentPage,
        pageSize,
        statusFilter === "all" ? undefined : statusFilter,
        typeFilter,
        debouncedSearch || undefined
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
  }, [currentPage, pageSize, statusFilter, typeFilter, debouncedSearch])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when status changes
  }

  const handleTypeFilterChange = (type: TypeFilter) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  // Keep URL params in sync with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    // status
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
    else params.delete("status")

    // type: map UI values to backend acceptable values
    const uiToBackendType = (t: TypeFilter): string | undefined => {
      switch (t) {
        case "account_verification":
          return "verification"
        case "vehicle_registration":
          return "registration"
        case "business_license":
          return "owner_enrollment"
        case "payout_failed":
          return "payouts"
        case "refund_request":
          return "refunds"
        case "reactivation_request":
          return "reactivation_requests"
        default:
          return undefined
      }
    }

    const mappedType = uiToBackendType(typeFilter)
    if (mappedType) params.set("type", mappedType)
    else params.delete("type")

    // page
    if (currentPage > 1) params.set("page", String(currentPage))
    else params.delete("page")

    // search (client-side only but keep in URL)
    if (searchQuery && searchQuery.trim().length > 0) params.set("search", searchQuery.trim())
    else params.delete("search")

    const qs = params.toString()
    const href = qs ? `${pathname}?${qs}` : pathname
    router.replace(href)
  }, [statusFilter, typeFilter, currentPage, searchQuery, router, pathname, searchParams])

  // Server-side search already applied; just use the results
  const filteredRequests = requests

  // Ensure we never exceed the page size limit
  const getPaginatedFilteredRequests = () => filteredRequests

  return {
    requests,
    filteredRequests: getPaginatedFilteredRequests(),
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    typeFilter,
    setTypeFilter: handleTypeFilterChange,
    refetch: fetchVerificationRequests,
    // Pagination
    currentPage,
    pagination,
    handlePageChange,
  }
}
