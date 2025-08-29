"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Archive, Trash2, Mail, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { getAccessToken } from "@/lib/jwt"
import { AdminRoute } from "@/components/auth/ProtectedRoute"

interface VerificationRequest {
  verification_id: string
  user_id: string
  doc_type: "driver_license" | "passport" | "national_id" | "business_license"
  doc_url: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  // Additional fields for UI
  user?: {
    name: string
    email: string
  }
}

const VerificationInbox = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/verification`, {
        method: "GET", // or POST/PUT depending on your API
        headers: {
          "Content-Type": "application/json",
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // Backend returns { verifications, pagination }
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

      setRequests(mapped);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      setRequests([]); // fallback
    } finally {
      setLoading(false);
    }
  };
  

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "identity":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Identity
          </Badge>
        )
      case "business":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Business
          </Badge>
        )
      case "document":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Document
          </Badge>
        )
      default:
        return <Badge variant="secondary">Other</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-amber-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

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

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground">Loading verification requests...</div>
      </div>
    )
  }

  return (
    <AdminRoute>
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-foreground">Verification Requests</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Requests</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-card px-6 py-2">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedItems.size === filteredRequests.length && filteredRequests.length > 0}
              onCheckedChange={selectAll}
            />
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-border">
            {filteredRequests.map((request) => (
              <Link prefetch={false} key={request.verification_id} href={`/admin/verification-requests/request-body/${request.verification_id}`}>
                <div className="flex items-center gap-3 px-6 py-2 hover:shadow-sm hover:bg-muted/30 cursor-pointer group">
                  <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                    <Checkbox
                      checked={selectedItems.has(request.verification_id)}
                      onCheckedChange={() => toggleSelection(request.verification_id)}
                    />
                  </div>

                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground w-40 truncate">
                      {request.user?.name || `User ${request.user_id}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate">
                          {request.doc_type.charAt(0).toUpperCase() + request.doc_type.slice(1)} Verification Request
                        </span>
                        {request.status === "pending" && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-xs text-muted-foreground">{formatDate(request.submitted_at)}</div>

                      <div
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AdminRoute>
  )
}

export default VerificationInbox
