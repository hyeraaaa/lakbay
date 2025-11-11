"use client"

import React, { useEffect, useState } from "react"
// plain layout (no Card container)
import { Input } from "@/components/ui/input"
import { Search, Calendar as CalendarIcon } from "lucide-react"
import type { BookingStatus, BookingFilters } from "@/services/bookingServices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

type StatusOption = { value: BookingStatus | "all"; label: string }

type Props = {
  searchQuery: string
  onSearch: (q: string) => void
  statusFilter: BookingStatus | "all"
  onStatusChange: (s: BookingStatus | "all") => void
  searchPlaceholder?: string
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
  searchPlaceholder,
  statusOptions,
  filters,
  updateFilters,
}) => {
  // Applied date range (what's actually in the filters)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(() => {
    const from = parseISOToDate(filters?.start_date)
    const to = parseISOToDate(filters?.end_date)
    if (!from && !to) return undefined
    return { from: from ?? undefined, to: to ?? undefined }
  })

  // Temporary date range (what the user is selecting in the calendar)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(appliedDateRange)

  useEffect(() => {
    const nextFrom = parseISOToDate(filters?.start_date)
    const nextTo = parseISOToDate(filters?.end_date)

    setAppliedDateRange((prev) => {
      if (!nextFrom && !nextTo) {
        if (!prev?.from && !prev?.to) return prev
        return undefined
      }

      const sameFrom = isSameDate(prev?.from, nextFrom)
      const sameTo = isSameDate(prev?.to, nextTo)
      if (sameFrom && sameTo) {
        return prev
      }

      return { from: nextFrom ?? undefined, to: nextTo ?? undefined }
    })
    
    // Sync temp range with applied range when filters change externally
    setTempDateRange({ from: nextFrom ?? undefined, to: nextTo ?? undefined })
  }, [filters?.start_date, filters?.end_date])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    // Only update temporary state, don't apply yet
    setTempDateRange(range)
  }

  const handleApplyDates = () => {
    // Apply the temporary selection to the filters
    setAppliedDateRange(tempDateRange)
    updateFilters({
      start_date: toISODate(tempDateRange?.from),
      end_date: toISODate(tempDateRange?.to),
      page: 1,
    })
  }

  const handleClearDates = () => {
    setTempDateRange(undefined)
    setAppliedDateRange(undefined)
    updateFilters({
      start_date: undefined,
      end_date: undefined,
      page: 1,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={searchPlaceholder || "Search by customer name, vehicle, or location..."}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}  
            className="pl-10 bg-white"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-white",
                appliedDateRange?.from || appliedDateRange?.to ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatRangeLabel(appliedDateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={tempDateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              initialFocus
            />
            <div className="flex justify-between gap-2 border-t p-3">
              <Button variant="ghost" size="sm" onClick={handleClearDates} disabled={!tempDateRange?.from && !tempDateRange?.to}>
                Clear
              </Button>
              <Button size="sm" onClick={handleApplyDates} disabled={!tempDateRange?.from || !tempDateRange?.to}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Badge Filters */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className="focus:outline-none"
          >
            <Badge
              className="rounded-sm px-3 py-1"
              variant={statusFilter === option.value ? "black" : "outline"}
            >
              {option.label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchFiltersCard

function parseISOToDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [yearStr, monthStr, dayStr] = value.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (!year || !month || !day) return undefined

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return undefined
  return date
}

function toISODate(date?: Date): string | undefined {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isSameDate(a?: Date, b?: Date): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatRangeLabel(range: DateRange | undefined): string {
  if (range?.from && range?.to) {
    return `${formatDate(range.from)} - ${formatDate(range.to)}`
  }
  if (range?.from) {
    return `From ${formatDate(range.from)}`
  }
  return "Date range"
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
