"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { verificationService, type VerificationRequest } from "@/services/verificationServices"
import { adminReviewService, type AdminReviewItem } from "@/services/adminReviewService"
import type { DateRange } from "react-day-picker"
import { format as formatDate } from "date-fns"

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
  status: "pending" | "approved" | "rejected" | "completed" | "processing" | "failed" | "disputed"
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)
  // Overall stats (unfiltered) for the stats card
  const [overallStats, setOverallStats] = useState<{
    total: number
    pending: number
    approved: number
    rejected: number
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

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
    const spFrom = searchParams.get("from")
    const spTo = searchParams.get("to")

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

    // Initialize date range from URL params
    if (spFrom || spTo) {
      // Parse YYYY-MM-DD as a LOCAL date to avoid UTC timezone shifts
      const parseLocalDate = (ymd: string | null): Date | undefined => {
        if (!ymd) return undefined
        const parts = ymd.split("-").map((p) => Number(p))
        if (parts.length !== 3) return undefined
        const [year, month, day] = parts
        const dt = new Date(year, month - 1, day)
        return isNaN(dt.getTime()) ? undefined : dt
      }
      const from = parseLocalDate(spFrom)
      const to = parseLocalDate(spTo)
      if (from) {
        setDateRange({ from, to: to || undefined })
      } else if (to) {
        setDateRange({ from: undefined, to })
      }
    }
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

  // Fetch overall stats once on mount (unfiltered)
  useEffect(() => {
    fetchOverallStats()
  }, [])

  useEffect(() => {
    fetchVerificationRequests()
  }, [statusFilter, typeFilter, currentPage, debouncedSearch, dateRange])

  // Fetch overall stats (all items, no filters)
  const fetchOverallStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      // Fetch all items without any filters to get overall counts
      // Use a very large limit to get all items for accurate counting
      const result = await adminReviewService.getAll(
        1,
        999999, // Very large limit to fetch all items
        undefined, // No status filter
        "all", // No type filter
        undefined // No search
      )
      
      const allItems = result.items
      const total = result.pagination?.total || allItems.length
      const pending = allItems.filter(r => r.status === "pending").length
      const approved = allItems.filter(r => r.status === "approved").length
      const rejected = allItems.filter(r => r.status === "rejected").length
      
      setOverallStats({ 
        total, 
        pending, 
        approved, 
        rejected 
      })
    } catch (error) {
      console.error("Failed to fetch overall stats:", error)
      setOverallStats({ total: 0, pending: 0, approved: 0, rejected: 0 })
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchVerificationRequests = useCallback(async () => {
    try {
      setLoading(true)
      // Format date range for API using LOCAL date to avoid UTC shifting
      const fromDate = dateRange?.from ? formatDate(dateRange.from, "yyyy-MM-dd") : undefined
      const toDate = dateRange?.to ? formatDate(dateRange.to, "yyyy-MM-dd") : undefined
      
      // Use server-side pagination with status and type filters
      const result = await adminReviewService.getAll(
        currentPage,
        pageSize,
        statusFilter === "all" ? undefined : statusFilter,
        typeFilter,
        debouncedSearch || undefined,
        fromDate,
        toDate
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
  }, [currentPage, pageSize, statusFilter, typeFilter, debouncedSearch, dateRange])

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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setCurrentPage(1) // Reset to first page when date range changes
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

    // date range
    if (dateRange?.from) {
      params.set("from", formatDate(dateRange.from, "yyyy-MM-dd"))
    } else {
      params.delete("from")
    }
    if (dateRange?.to) {
      params.set("to", formatDate(dateRange.to, "yyyy-MM-dd"))
    } else {
      params.delete("to")
    }

    const qs = params.toString()
    const href = qs ? `${pathname}?${qs}` : pathname
    router.replace(href, { scroll: false })
  }, [statusFilter, typeFilter, currentPage, searchQuery, dateRange, router, pathname, searchParams])

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
    dateRange,
    setDateRange: handleDateRangeChange,
    refetch: fetchVerificationRequests,
    // Pagination
    currentPage,
    pagination,
    handlePageChange,
    // Overall stats (unfiltered)
    overallStats,
    statsLoading,
  }
}
