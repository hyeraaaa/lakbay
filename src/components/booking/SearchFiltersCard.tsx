"use client"

import type React from "react"
// plain layout (no Card container)
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X, Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { BookingFilters, BookingStatus } from "@/services/bookingServices"

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
  showFilters,
  setShowFilters,
  filters,
  updateFilters,
  clearFilters,
  statusOptions,
}) => {
  const hasActiveFilters = searchQuery || statusFilter !== "all" || filters.start_date || filters.end_date

  return (
    <div className="ms-0 p-0 w-full">
      <div className="space-y-6">
          {/* Main search and filter row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="w-full lg:max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by customer name, vehicle, or location..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-12 h-12 bg-background border-gray-300 shadow-none focus:ring-0 focus-visible:ring-0 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap items-center lg:ml-auto">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-48 h-12 bg-background border-gray-300 shadow-none focus:ring-0 focus-visible:ring-0">
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

              {/* Inline date pickers (small) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 border-gray-300 shadow-none text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date ? format(new Date(filters.start_date), "MMM dd, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-none" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.start_date ? new Date(filters.start_date) : undefined}
                    onSelect={(date) => updateFilters({ start_date: date ? date.toISOString().slice(0,10) : undefined, page: 1 })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 border-gray-300 shadow-none text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date ? format(new Date(filters.end_date), "MMM dd, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-none" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.end_date ? new Date(filters.end_date) : undefined}
                    onSelect={(date) => updateFilters({ end_date: date ? date.toISOString().slice(0,10) : undefined, page: 1 })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Removed advanced filters section; calendars are inline now */}
        </div>
      </div>
  )
}

export default SearchFiltersCard
