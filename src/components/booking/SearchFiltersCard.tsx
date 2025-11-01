"use client"

import React, { useState } from "react"
// plain layout (no Card container)
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { BookingStatus, BookingFilters } from "@/services/bookingServices"

type StatusOption = { value: BookingStatus | "all"; label: string }

type Props = {
  searchQuery: string
  onSearch: (q: string) => void
  statusFilter: BookingStatus | "all"
  onStatusChange: (s: BookingStatus | "all") => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  filters: BookingFilters
  updateFilters: (f: Partial<BookingFilters>) => void
  clearFilters: () => void
  statusOptions: StatusOption[]
}

export const SearchFiltersCard: React.FC<Props> = ({
  searchQuery,
  onSearch,
  statusFilter,
  onStatusChange,
  statusOptions,
}) => {

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by customer name, vehicle, or location..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default SearchFiltersCard
