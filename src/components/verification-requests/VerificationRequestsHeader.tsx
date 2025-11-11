"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar as CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

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
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export default function VerificationRequestsHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange,
}: VerificationRequestsHeaderProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange)

  // Sync temp range when dateRange prop changes
  useEffect(() => {
    setTempDateRange(dateRange)
  }, [dateRange])

  const handleApplyDates = () => {
    setDateRange(tempDateRange)
    setIsDatePickerOpen(false)
  }

  const handleClearDates = () => {
    setTempDateRange(undefined)
    setDateRange(undefined)
    setIsDatePickerOpen(false)
  }

  const formatRangeLabel = (range: DateRange | undefined): string => {
    if (range?.from && range?.to) {
      return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`
    }
    if (range?.from) {
      return `From ${format(range.from, "MMM dd, yyyy")}`
    }
    return "Date range"
  }

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
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-white border-neutral-300 justify-start text-left font-normal whitespace-nowrap",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from || dateRange?.to ? (
                formatRangeLabel(dateRange)
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
            />
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearDates}
                  className="flex-1"
                  disabled={!tempDateRange?.from && !tempDateRange?.to}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyDates}
                  className="flex-1"
                  disabled={!tempDateRange?.from || !tempDateRange?.to}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
