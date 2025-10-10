"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MoreHorizontal,
  Eye,
  CheckCircle,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { bookingService, BookingStatus, PaymentStatus, type Booking } from "@/services/bookingServices"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

type OwnerBookingsDataTableProps = {
  bookings: Booking[]
  onAction?: (action: string, bookingId: number) => void | Promise<void>
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  pageSize?: number
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getPaymentStatusColor = (status: PaymentStatus) => {
  const map: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: "bg-amber-500/10 text-amber-700 border-amber-200",
    [PaymentStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    [PaymentStatus.DENIED]: "bg-red-500/10 text-red-700 border-red-200",
    [PaymentStatus.REFUNDED]: "bg-blue-500/10 text-blue-700 border-blue-200",
    [PaymentStatus.PARTIALLY_REFUNDED]: "bg-orange-500/10 text-orange-700 border-orange-200",
    [PaymentStatus.EXPIRED]: "bg-slate-500/10 text-slate-700 border-slate-200",
  }
  return map[status] || map[PaymentStatus.PENDING]
}

const getBookingStatusColor = (status: BookingStatus) => {
  const map: Record<BookingStatus, string> = {
    [BookingStatus.PENDING_PAYMENT]: "bg-amber-50 text-amber-700 border-amber-200",
    [BookingStatus.AWAITING_OWNER_APPROVAL]: "bg-blue-50 text-blue-700 border-blue-200",
    [BookingStatus.CONFIRMED]: "bg-teal-50 text-teal-700 border-teal-200",
    [BookingStatus.ON_GOING]: "bg-purple-50 text-purple-700 border-purple-200",
    [BookingStatus.CANCELED]: "bg-red-50 text-red-700 border-red-200",
    [BookingStatus.COMPLETED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }
  return map[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
}

export function OwnerBookingsDataTable({
  bookings,
  onAction,
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: OwnerBookingsDataTableProps) {
  const data = useMemo(() => bookings ?? [], [bookings])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [optimisticStatusById, setOptimisticStatusById] = useState<Record<number, BookingStatus>>({})
  const [rowLoadingById, setRowLoadingById] = useState<Record<number, boolean>>({})
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    bookingId: number | null
    actionKey: "approve" | "checkout" | "checkin" | null
    title?: string
    description?: string
    confirmText?: string
  }>({ open: false, bookingId: null, actionKey: null })

  const columns: ColumnDef<Booking>[] = useMemo(
    () => [
      {
        header: "Vehicle",
        accessorKey: "vehicle",
        cell: ({ row }) => {
          const b = row.original
          return (
            <div>
              <div className="font-medium">
                {b.vehicle?.brand} {b.vehicle?.model}
              </div>
              <div className="text-xs text-muted-foreground">{b.vehicle?.year}</div>
            </div>
          )
        },
        size: 260,
      },
      {
        header: "Renter",
        accessorKey: "users",
        cell: ({ row }) => {
          const u = row.original.users
          return (
            <span>
              {u?.first_name} {u?.last_name}
            </span>
          )
        },
        size: 200,
      },
      {
        header: "Date Range",
        accessorKey: "start_date",
        cell: ({ row }) => {
          const b = row.original
          return (
            <span className="whitespace-nowrap">
              {formatDate(b.start_date)} - {formatDate(b.end_date)}
            </span>
          )
        },
        size: 220,
      },
      {
        header: "Payment Status",
        accessorKey: "payment_details",
        cell: ({ row }) => {
          const pd = row.original.payment_details?.[0]
          if (!pd) return <span className="text-muted-foreground">N/A</span>
          return (
            <Badge className={cn("border px-2 py-0.5 text-[11px]", getPaymentStatusColor(pd.payment_status))}>
              {bookingService.utils.getPaymentStatusDisplayText(pd.payment_status)}
            </Badge>
          )
        },
        size: 180,
      },
      {
        header: "Booking Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const currentStatus = optimisticStatusById[row.original.booking_id] ?? (row.original.status as BookingStatus)
          return (
            <Badge className={cn("border px-2 py-0.5 text-[11px]", getBookingStatusColor(currentStatus))}>
              {bookingService.utils.getStatusDisplayText(currentStatus)}
            </Badge>
          )
        },
        size: 170,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const b = row.original
          const actions = [
            b.status === BookingStatus.AWAITING_OWNER_APPROVAL && { label: "Approve", key: "approve" },
            b.status === BookingStatus.CONFIRMED && { label: "Check Out", key: "checkout" },
            b.status === BookingStatus.ON_GOING && { label: "Check In", key: "checkin" },
          ].filter(Boolean) as { label: string; key: string }[]
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Open actions menu"
                    title="Actions"
                    disabled={rowLoadingById[b.booking_id]}
                  >
                    {rowLoadingById[b.booking_id] ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MoreHorizontal size={16} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem onClick={() => onAction?.("view", b.booking_id)}>
                    <Eye size={16} className="mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {actions.length > 0 ? (
                    actions.map((a) => (
                      <DropdownMenuItem
                        key={a.key}
                        disabled={rowLoadingById[b.booking_id]}
                        onSelect={(e) => {
                          // Keep dropdown open until server responds
                          e.preventDefault()
                          const titles: Record<string, string> = {
                            approve: "Approve Booking",
                            checkout: "Check Out Vehicle",
                            checkin: "Check In Vehicle",
                          }
                          const descriptions: Record<string, string> = {
                            approve:
                              "Approve this booking. The customer will be notified and payment processing will proceed.",
                            checkout:
                              "Confirm that the renter has picked up the vehicle and the rental period has started.",
                            checkin: "Confirm that the renter has returned the vehicle and complete the booking.",
                          }
                          const confirmText: Record<string, string> = {
                            approve: "Approve",
                            checkout: "Check Out",
                            checkin: "Check In",
                          }
                          setConfirmState({
                            open: true,
                            bookingId: b.booking_id,
                            actionKey: a.key as "approve" | "checkout" | "checkin",
                            title: titles[a.key],
                            description: descriptions[a.key],
                            confirmText: confirmText[a.key],
                          })
                        }}
                      >
                        {rowLoadingById[b.booking_id] ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <>
                            {a.key === "approve" && <CheckCircle size={16} className="mr-2" />}
                            {a.key === "checkout" && <LogOut size={16} className="mr-2" />}
                            {a.key === "checkin" && <LogIn size={16} className="mr-2" />}
                          </>
                        )}
                        {rowLoadingById[b.booking_id] ? "Processing..." : a.label}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No status-based actions</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        enableSorting: false,
        size: 56,
      },
    ],
    [onAction, optimisticStatusById, rowLoadingById],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  })

  return (
    <div className="space-y-4">
      {table.getRowModel().rows?.length ? (
        <>
          <div className="bg-background rounded-md border">
            <div className="overflow-x-auto">
              <Table className="table-fixed min-w-[880px]">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          style={{ width: `${header.getSize()}px` }}
                          className={cn(
                            "h-11",
                            header.column.id === "actions" && "text-right pr-10",
                            header.column.id === "vehicle" && "pl-10",
                          )}
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <div
                              className={cn(
                                header.column.getCanSort() &&
                                  "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                              onKeyDown={(e) => {
                                if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                                  e.preventDefault()
                                  header.column.getToggleSortingHandler()?.(e)
                                }
                              }}
                              tabIndex={header.column.getCanSort() ? 0 : undefined}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                                desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === "actions" && "pr-10 text-right",
                            cell.column.id === "vehicle" && "pl-10",
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-8">
            <div />
            <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
              <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                {typeof totalItems === "number" && typeof page === "number" && typeof pageSize === "number" ? (
                  <>
                    <span className="text-foreground">
                      {Math.min((page - 1) * pageSize + 1, Math.max(totalItems, 0))}-
                      {Math.min(page * pageSize, Math.max(totalItems, 0))}
                    </span>{" "}
                    of <span className="text-foreground">{totalItems}</span>
                  </>
                ) : (
                  <>
                    <span className="text-foreground">
                      {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                      {Math.min(
                        Math.max(
                          table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                            table.getState().pagination.pageSize,
                          0,
                        ),
                        table.getRowCount(),
                      )}
                    </span>{" "}
                    of <span className="text-foreground">{table.getRowCount().toString()}</span>
                  </>
                )}
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
                      onClick={() => (onPageChange ? onPageChange(1) : table.firstPage())}
                      disabled={onPageChange ? (page ?? 1) <= 1 : !table.getCanPreviousPage()}
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
                      onClick={() => (onPageChange ? onPageChange(Math.max((page ?? 1) - 1, 1)) : table.previousPage())}
                      disabled={onPageChange ? (page ?? 1) <= 1 : !table.getCanPreviousPage()}
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
                      onClick={() =>
                        onPageChange
                          ? onPageChange(Math.min((page ?? 1) + 1, totalPages ?? page ?? 1))
                          : table.nextPage()
                      }
                      disabled={onPageChange ? (page ?? 1) >= (totalPages ?? page ?? 1) : !table.getCanNextPage()}
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
                      onClick={() => (onPageChange ? onPageChange(totalPages ?? page ?? 1) : table.lastPage())}
                      disabled={onPageChange ? (page ?? 1) >= (totalPages ?? page ?? 1) : !table.getCanNextPage()}
                      aria-label="Go to last page"
                    >
                      <ChevronLastIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-4 text-muted-foreground/40"
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="20" y="30" width="80" height="70" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              d="M35 30V22C35 20.8954 35.8954 20 37 20H43C44.1046 20 45 20.8954 45 22V30"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M75 30V22C75 20.8954 75.8954 20 77 20H83C84.1046 20 85 20.8954 85 22V30"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line x1="20" y1="45" x2="100" y2="45" stroke="currentColor" strokeWidth="2" />
            <circle cx="35" cy="60" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="50" cy="60" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="65" cy="60" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="80" cy="60" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="35" cy="75" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="50" cy="75" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="65" cy="75" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="80" cy="75" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="35" cy="90" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="50" cy="90" r="3" fill="currentColor" opacity="0.3" />
            <path
              d="M55 70L60 75L70 65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No bookings found</h3>
          <p className="text-sm text-muted-foreground">Bookings will appear here once customers make reservations</p>
        </div>
      )}

      <ConfirmationDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, open }))}
        title={confirmState.title || "Confirm Action"}
        description={confirmState.description || "Are you sure you want to proceed?"}
        confirmText={confirmState.confirmText || "Confirm"}
        onConfirm={async () => {
          const bookingId = confirmState.bookingId
          const actionKey = confirmState.actionKey
          if (!bookingId || !actionKey) return

          const optimisticMap: Record<string, BookingStatus> = {
            approve: BookingStatus.PENDING_PAYMENT,
            checkout: BookingStatus.ON_GOING,
            checkin: BookingStatus.COMPLETED,
          }
          const nextStatus = optimisticMap[actionKey as keyof typeof optimisticMap]
          if (nextStatus) {
            setOptimisticStatusById((prev) => ({ ...prev, [bookingId]: nextStatus }))
          }
          setRowLoadingById((prev) => ({ ...prev, [bookingId]: true }))
          try {
            await Promise.resolve(onAction?.(actionKey, bookingId))
          } finally {
            setRowLoadingById((prev) => ({ ...prev, [bookingId]: false }))
          }
        }}
      />
    </div>
  )
}

export default OwnerBookingsDataTable
