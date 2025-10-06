"use client"

import { useState, useEffect } from "react"
import { verificationService, type VerificationRequest } from "@/services/verificationServices"
import { adminReviewService, type AdminReviewItem } from "@/services/adminReviewService"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

// Extended interface to handle both verification requests and registrations
interface ExtendedRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "id_card" | "business_license" | "vehicle_registration"
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

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      const unified: AdminReviewItem[] = await adminReviewService.getAll()
      const sorted = [...unified].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      setRequests(sorted)
    } catch (error) {
      console.error("Error fetching verification requests:", error)
      setRequests([])
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
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
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

  return {
    requests,
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedItems,
    toggleSelection,
    selectAll,
    refetch: fetchVerificationRequests,
  }
}
