"use client"

import { useState, useEffect } from "react"
import { getAccessToken } from "@/lib/jwt"

export interface VerificationRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "national_id" | "business_license"
  doc_url: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  user?: {
    name: string
    email: string
  }
}

type StatusFilter = "all" | "pending" | "approved" | "rejected"

export const useVerificationRequests = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/verification`, {
        headers: {
          "Content-Type": "application/json",
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
      })
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      const mapped: VerificationRequest[] = (data?.verifications || []).map((v: any) => {
        const userInfo = v?.users_verification_user_idTousers
        const name = userInfo ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() : ""
        return {
          verification_id: v.verification_id,
          user_id: v.user_id,
          doc_type: v.doc_type,
          doc_url: v.doc_url,
          status: v.status,
          submitted_at: v.submitted_at,
          reviewed_at: v.reviewed_at,
          reviewed_by: v.reviewed_by,
          notes: v.notes,
          user: userInfo ? { name, email: userInfo.email } : undefined,
        }
      })
      setRequests(mapped)
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
      request.user_id.toLowerCase().includes(searchQuery.toLowerCase())
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
