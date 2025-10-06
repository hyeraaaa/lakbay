"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MoreHorizontal, Eye, Ban, UserCheck, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import type { AdminUserSummary } from "@/services/adminUserService"

type UsersDataTableProps = {
  users: AdminUserSummary[]
  page?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onAction?: (action: "view" | "activate" | "deactivate" | "ban", userId: number) => void | Promise<void>
}

const getAccountStatusColor = (status?: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deactivated: "bg-amber-50 text-amber-700 border-amber-200",
    banned: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-blue-50 text-blue-700 border-blue-200",
  }
  return map[String(status || "")] ?? "bg-slate-50 text-slate-700 border-slate-200"
}

export function UsersDataTable({ users, onAction, page, totalPages, onPageChange, totalItems, pageSize }: UsersDataTableProps) {
  const data = useMemo(() => users ?? [], [users])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const columns: ColumnDef<AdminUserSummary>[] = useMemo(() => [
    {
      header: "Name",
      accessorKey: "first_name",
      cell: ({ row }) => {
        const u = row.original
        return (
          <div>
            <div className="font-medium">{u.first_name} {u.last_name}</div>
            <div className="text-xs text-muted-foreground">@{u.username || "n/a"}</div>
          </div>
        )
      },
      size: 240,
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: ({ row }) => {
        const u = row.original
        return (
          <div>
            <div>{u.email}</div>
            <div className="text-xs text-muted-foreground">{u.phone || "No phone"}</div>
          </div>
        )
      },
      size: 260,
    },
    {
      header: "Type",
      accessorKey: "user_type",
      size: 120,
    },
    {
      header: "Account Status",
      accessorKey: "account_status",
      cell: ({ row }) => {
        const u = row.original
        return (
          <Badge className={cn("border px-2 py-0.5 text-[11px]", getAccountStatusColor(u.account_status))}>
            {u.account_status}
          </Badge>
        )
      },
      size: 160,
    },
    {
      header: "Verification",
      id: "verification",
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className={cn(u.is_email_verified ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600")}>Email {u.is_email_verified ? "Verified" : "Unverified"}</Badge>
            <Badge variant="outline" className={cn(u.is_verified ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600")}>Account {u.is_verified ? "Verified" : "Unverified"}</Badge>
          </div>
        )
      },
      size: 280,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open actions menu" title="Actions">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onClick={() => onAction?.("view", u.user_id)}>
                  <Eye size={16} className="mr-2" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction?.("activate", u.user_id)}>
                  <UserCheck size={16} className="mr-2" /> Activate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction?.("deactivate", u.user_id)}>
                  <UserX size={16} className="mr-2" /> Deactivate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction?.("ban", u.user_id)} className="text-red-600">
                  <Ban size={16} className="mr-2" /> Ban
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      size: 120,
    },
  ], [onAction])

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
      <div className="bg-background rounded-md border">
        <div className="overflow-x-auto">
          <Table className="table-fixed min-w-[980px]">
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
                        header.column.id === "first_name" && "pl-10",
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn("flex h-full cursor-pointer items-center justify-between gap-2 select-none")}
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.id === "actions" && "pr-10 text-right",
                          cell.column.id === "first_name" && "pl-10",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
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
                  {Math.min((page - 1) * pageSize + 1, Math.max(totalItems, 0))}-{Math.min(page * pageSize, Math.max(totalItems, 0))}
                </span>{" "}
                of <span className="text-foreground">{totalItems}</span>
              </>
            ) : (
              <>
                <span className="text-foreground">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-{Math.min(
                    Math.max(
                      table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize,
                      0
                    ),
                    table.getRowCount()
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
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => (onPageChange ? onPageChange(1) : table.firstPage())} disabled={onPageChange ? (page ?? 1) <= 1 : !table.getCanPreviousPage()} aria-label="Go to first page">
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => (onPageChange ? onPageChange(Math.max((page ?? 1) - 1, 1)) : table.previousPage())} disabled={onPageChange ? (page ?? 1) <= 1 : !table.getCanPreviousPage()} aria-label="Go to previous page">
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => (onPageChange ? onPageChange(Math.min((page ?? 1) + 1, totalPages ?? (page ?? 1))) : table.nextPage())} disabled={onPageChange ? (page ?? 1) >= (totalPages ?? (page ?? 1)) : !table.getCanNextPage()} aria-label="Go to next page">
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => (onPageChange ? onPageChange(totalPages ?? (page ?? 1)) : table.lastPage())} disabled={onPageChange ? (page ?? 1) >= (totalPages ?? (page ?? 1)) : !table.getCanNextPage()} aria-label="Go to last page">
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default UsersDataTable


