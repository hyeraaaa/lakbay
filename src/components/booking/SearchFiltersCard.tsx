"use client"

import React, { useState, useEffect, useMemo } from "react"
// plain layout (no Card container)
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { BookingFilters, BookingStatus } from "@/services/bookingServices"
import { formatDateToPhilippine, parsePhilippineDate } from "@/lib/utils"

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
  // Convert start_date and end_date to DateRange (treating them as Philippine local dates)
  const dateRange: DateRange | undefined = useMemo(() => {
    return filters.start_date || filters.end_date
      ? {
          from: parsePhilippineDate(filters.start_date),
          to: parsePhilippineDate(filters.end_date),
        }
      : undefined
  }, [filters.start_date, filters.end_date])

  // Temporary state for date range being selected
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange)
  const [isOpen, setIsOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ q: searchQuery || undefined, page: 1 } as Partial<BookingFilters>);
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery, updateFilters])

  // Update temp date range when popover opens
  useEffect(() => {
    if (isOpen) {
      setTempDateRange(dateRange)
    }
  }, [isOpen, dateRange])

  const handleApply = () => {
    updateFilters({
      start_date: formatDateToPhilippine(tempDateRange?.from),
      end_date: formatDateToPhilippine(tempDateRange?.to),
      page: 1
    })
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempDateRange(dateRange)
    setIsOpen(false)
  }

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
        <SelectTrigger className="w-48 bg-white">
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

      {/* Date Range Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal whitespace-nowrap text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            {dateRange?.from && dateRange?.to ? (
              <span className="truncate">
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </span>
            ) : dateRange?.from ? (
              <span className="truncate">{format(dateRange.from, "MMM dd")}</span>
            ) : (
              <span className="truncate">Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={tempDateRange}
            onSelect={setTempDateRange}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="text-sm"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SearchFiltersCard
