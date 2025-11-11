'use client'
import React from 'react'
import { logsService, type LogItem } from '@/services/logsService'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { ChevronFirstIcon, ChevronLeftIcon, ChevronRightIcon, ChevronLastIcon, Search, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'

const MIN_SEARCH_LENGTH = 2

export default function Page() {
  const [items, setItems] = React.useState<LogItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState<number>(1)
  const [limit] = React.useState<number>(25)
  const [total, setTotal] = React.useState<number>(0)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const [search, setSearch] = React.useState<string>('')
  const [action, setAction] = React.useState<string>('all')
  const [category, setCategory] = React.useState<string>('all')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [startDateObj, setStartDateObj] = React.useState<Date | undefined>(undefined)
  const [endDateObj, setEndDateObj] = React.useState<Date | undefined>(undefined)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Build action options (backend-supported + from data)
  const ACTION_DEFS: { value: string; label: string }[] = React.useMemo(
    () => [
      { value: 'insert', label: 'Insert' },
      { value: 'update', label: 'Update' },
      { value: 'delete', label: 'Delete' },
      { value: 'read', label: 'Read' },
      { value: 'login', label: 'Login' },
      { value: 'logout', label: 'Logout' },
      { value: 'profile_update', label: 'Profile Update' },
      { value: 'vehicle_create', label: 'Vehicle Create' },
      { value: 'vehicle_update', label: 'Vehicle Update' },
      { value: 'vehicle_delete', label: 'Vehicle Delete' },
      { value: 'image_upload', label: 'Image Upload' },
      { value: 'image_delete', label: 'Image Delete' },
      { value: 'booking_create', label: 'Booking Create' },
      { value: 'booking_update', label: 'Booking Update' },
      { value: 'booking_cancel', label: 'Booking Cancel' },
      { value: 'booking_approve', label: 'Booking Approve' },
      { value: 'booking_checkout', label: 'Booking Checkout' },
      { value: 'booking_checkin', label: 'Booking Checkin' },
      { value: 'payment_process', label: 'Payment Process' },
      { value: 'refund_request', label: 'Refund Request' },
      { value: 'dispute_create', label: 'Dispute Create' },
      { value: 'verification_submit', label: 'Verification Submit' },
      { value: 'verification_approve', label: 'Verification Approve' },
      { value: 'verification_reject', label: 'Verification Reject' },
      { value: 'owner_enrollment_submit', label: 'Owner Enrollment Submit' },
      { value: 'owner_enrollment_approve', label: 'Owner Enrollment Approve' },
      { value: 'owner_enrollment_reject', label: 'Owner Enrollment Reject' },
      { value: 'user_activate', label: 'User Activate' },
      { value: 'user_deactivate', label: 'User Deactivate' },
      { value: 'user_ban', label: 'User Ban' },
      { value: 'user_unban', label: 'User Unban' },
    ],
    []
  )
  const actionOptions = React.useMemo(() => {
    const base = new Map<string, string>(ACTION_DEFS.map((a) => [a.value, a.label]))
    items.forEach((i) => {
      const v = i.action
      if (v && !base.has(v)) base.set(v, v.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()))
    })
    return Array.from(base.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items, ACTION_DEFS])
  // Valid categories expected by backend with user-friendly labels
  const VALID_CATEGORY_DEFS: { value: string; label: string }[] = React.useMemo(
    () => [
      { value: 'authentication', label: 'Authentication' },
      { value: 'user_management', label: 'User Management' },
      { value: 'vehicle_management', label: 'Vehicle Management' },
      { value: 'booking_management', label: 'Booking Management' },
      { value: 'payment_financial', label: 'Payments & Financial' },
      { value: 'verification_enrollment', label: 'Verification & Enrollment' },
      { value: 'communication', label: 'Communication' },
      { value: 'admin_operations', label: 'Admin Operations' },
      { value: 'reports_moderation', label: 'Reports & Moderation' },
      { value: 'notifications', label: 'Notifications' },
    ],
    []
  )
  const categoryOptions = React.useMemo(() => {
    // Start with valid backend categories
    const base = new Map<string, string>(VALID_CATEGORY_DEFS.map((c) => [c.value, c.label]))
    // Blocked categories (do not show even if present in data)
    const BLOCKED = new Set<string>(['audit_invoicing', 'vehicle_tracking', 'webhooks_utilities', 'general'])
    // Add any additional categories encountered in data (fallback label = value)
    items.forEach((i) => {
      const v = i.activity_category
      if (v && !base.has(v) && !BLOCKED.has(v)) base.set(v, v)
    })
    return Array.from(base.entries()).map(([value, label]) => ({ value, label }))
  }, [items, VALID_CATEGORY_DEFS])

  const formatLabel = React.useCallback((value?: string | null) => {
    if (!value) return '—'
    return String(value)
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }, [])

  const trimmedSearch = React.useMemo(() => search.trim(), [search])
  const isSearchActive = trimmedSearch.length >= MIN_SEARCH_LENGTH
  const isSearchTooShort = trimmedSearch.length > 0 && !isSearchActive

  React.useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    logsService
      .list({
        page,
        limit,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        action: action !== 'all' ? action : undefined,
        activityCategory: category !== 'all' ? category : undefined,
        search: isSearchActive ? trimmedSearch : undefined,
      })
      .then(({ items, pagination }) => {
        if (!isMounted) return
        setItems(items)
        if (pagination) {
          setTotal(pagination.total)
          setTotalPages(pagination.totalPages)
        }
      })
      .catch((e) => {
        if (isMounted) setError(e?.message || 'Failed to load logs')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [page, limit, startDate, endDate, action, category, trimmedSearch, isSearchActive])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Recent user and system activities</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="pt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-1 flex-col max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by user name"
                    value={search}
                    onChange={(e) => {
                      setPage(1)
                      setSearch(e.target.value)
                    }}
                    className="pl-10 bg-white"
                  />
                </div>
                {isSearchTooShort && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter at least {MIN_SEARCH_LENGTH} characters to search.
                  </p>
                )}
              </div>

              <Select
                value={action}
                onValueChange={(v) => {
                  setPage(1)
                  setAction(v)
                }}
              >
                <SelectTrigger className="bg-white border-neutral-300">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white",
                      dateRange?.from || dateRange?.to ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to
                      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                      : dateRange?.from
                      ? `From ${dateRange.from.toLocaleDateString()}`
                      : "Date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setPage(1)
                      setDateRange(range || undefined)
                      const from = range?.from
                      const to = range?.to
                      setStartDateObj(from)
                      setEndDateObj(to)
                      const isoFrom = from ? `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}` : ''
                      const isoTo = to ? `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}` : ''
                      setStartDate(isoFrom)
                      setEndDate(isoTo)
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />  
                </PopoverContent>
              </Popover>

              {(action !== 'all' || category !== 'all' || startDate || endDate || search) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage(1)
                    setSearch('')
                    setAction('all')
                    setCategory('all')
                    setStartDate('')
                    setEndDate('')
                    setStartDateObj(undefined)
                    setEndDateObj(undefined)
                    setDateRange(undefined)
                  }}
                  className="ml-auto"
                >
                  Clear filters
                </Button>
              )}
            </div>
            
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPage(1)
                  setCategory('all')
                }}
                className="focus:outline-none"
              >
                <Badge className="rounded-sm px-3 py-1" variant={category === 'all' ? 'black' : 'outline'}>
                  All categories
                </Badge>
              </button>
              {categoryOptions.map((opt) => {
                const active = category === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(1)
                      setCategory(opt.value)
                    }}
                    className="focus:outline-none"
                  >
                    <Badge className="rounded-sm px-3 py-1" variant={active ? 'black' : 'outline'}>
                      {opt.label}
                    </Badge>
                  </button>
                )
              })}
            </div>

          </div>
          {loading ? (
            <div className="space-y-4">
              {/* Table skeleton */}
              <div className="bg-white border border-neutral-300">
                <div className="overflow-x-auto">
                  <div className="min-w-[980px]">
                    <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b">
                      <Skeleton className="h-5 w-40" />   {/* User Name */}
                      <Skeleton className="h-5 w-24" />   {/* Action */}
                      <Skeleton className="h-5 w-48" />   {/* Activity Title */}
                      <Skeleton className="h-5 w-72" />   {/* Activity Description */}
                      <Skeleton className="h-5 w-40" />   {/* Activity Category */}
                      <Skeleton className="h-5 w-40" />   {/* Timestamp */}
                    </div>
                    <div className="space-y-0">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="grid grid-cols-6 gap-4 items-center px-4 py-3 border-b">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-[520px]" />
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer pagination skeleton */}
              <div className="flex items-center justify-between gap-8">
                <div />
                <div className="flex grow justify-end">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">Error: {error}</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="mb-4 text-muted-foreground/40"
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="60" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M40 90L60 70L80 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground mb-1">No logs found</h3>
              <p className="text-sm text-muted-foreground">There are no activities to display yet.</p>
            </div>
          ) : (
            <div className="bg-background border border-neutral-300">
              <div className="overflow-x-auto">
                <Table className="table-fixed min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-11 px-4">User Name</TableHead>
                      <TableHead className="h-11 px-4">Action</TableHead>
                      <TableHead className="h-11 px-4">Activity Title</TableHead>
                      <TableHead className="h-11 px-4">Activity Description</TableHead>
                      <TableHead className="h-11 px-4">Activity Category</TableHead>
                      <TableHead className="h-11 px-4">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((log) => {
                      const userDisplay =
                        log.user_name ??
                        (typeof log.user_id === 'number' ? `User #${log.user_id}` : 'N/A')
                      const ts = log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'
                      return (
                        <TableRow key={`${log.id}-${log.action}-${log.timestamp}`}>
                          <TableCell className="px-4">{userDisplay}</TableCell>
                          <TableCell className="px-4">{formatLabel(log.action)}</TableCell>
                          <TableCell className="px-4">{formatLabel(log.activity_title)}</TableCell>
                          <TableCell className="px-4 max-w-[520px] truncate">{log.activity_description || '—'}</TableCell>
                          <TableCell className="px-4">{formatLabel(log.activity_category)}</TableCell>
                          <TableCell className="px-4">{ts}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="flex items-center justify-between gap-8 mt-4">
              <div />
              <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                  <span className="text-foreground">
                    {Math.min((page - 1) * limit + 1, Math.max(total, 0))}-{Math.min(page * limit, Math.max(total, 0))}
                  </span>{' '}
                  of <span className="text-foreground">{total}</span>
                </p>
              </div>
              <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        size="icon"
                        variant="outline"
                        className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                        onClick={() => setPage(1)}
                        disabled={page === 1 || loading}
                        aria-label="Go to first page"
                      >
                        <ChevronFirstIcon size={16} aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        size="icon"
                        variant="outline"
                        className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        aria-label="Go to previous page"
                      >
                        <ChevronLeftIcon size={16} aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        size="icon"
                        variant="outline"
                        className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        aria-label="Go to next page"
                      >
                        <ChevronRightIcon size={16} aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        size="icon"
                        variant="outline"
                        className="disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages || loading}
                        aria-label="Go to last page"
                      >
                        <ChevronLastIcon size={16} aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
