"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type TypeFilter =
  | "all"
  | "account_verification"
  | "business_license"
  | "vehicle_registration"
  | "payout_failed"
  | "refund_request"
  | "reactivation_request"

interface VerificationRequestsHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: StatusFilter
  setStatusFilter: (filter: StatusFilter) => void
  typeFilter: TypeFilter
  setTypeFilter: (filter: TypeFilter) => void
}

export default function VerificationRequestsHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: VerificationRequestsHeaderProps) {
  return (
    <header className="border-b border-border py-3">
      {/* Search and Status Filter */}
      <div className="flex items-center gap-4 mb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger className="bg-white border-neutral-300">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="approved">Approved Only</SelectItem>
            <SelectItem value="rejected">Rejected Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type Badge Filters */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-4">
        <button onClick={() => setTypeFilter("all")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "all" ? "black" : "outline"}>All</Badge>
        </button>
        <button onClick={() => setTypeFilter("account_verification")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "account_verification" ? "black" : "outline"}>Account Verification</Badge>
        </button>
        <button onClick={() => setTypeFilter("business_license")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "business_license" ? "black" : "outline"}>Business Permit</Badge>
        </button>
        <button onClick={() => setTypeFilter("vehicle_registration")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "vehicle_registration" ? "black" : "outline"}>Vehicle Registration</Badge>
        </button>
        <button onClick={() => setTypeFilter("payout_failed")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "payout_failed" ? "black" : "outline"}>Failed Payout</Badge>
        </button>
        <button onClick={() => setTypeFilter("refund_request")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "refund_request" ? "black" : "outline"}>Refund Request</Badge>
        </button>
        <button onClick={() => setTypeFilter("reactivation_request")} className="focus:outline-none">
          <Badge className="rounded-sm px-3 py-1" variant={typeFilter === "reactivation_request" ? "black" : "outline"}>Account Reactivation</Badge>
        </button>
      </div>
    </header>
  )
}
