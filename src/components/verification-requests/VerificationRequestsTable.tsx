"use client"

import { useMemo } from "react"
import { type ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import { encodeId } from "@/lib/idCodec"

type VerificationRequest = {
  verification_id: string
  user_id: string
  user?: {
    name?: string
    email?: string
  }
  doc_type: string
  status: "pending" | "approved" | "rejected" | "completed" | "processing" | "failed" | "disputed"
  submitted_at: string
}

type VerificationRequestsTableProps = {
  requests: VerificationRequest[]
}

const getStatusBadge = (status: VerificationRequest["status"], docType?: string) => {
  // Handle refund-specific statuses
  if (docType === "refund_request") {
    switch (status) {
      case "completed":
        return { label: "Completed", className: "border-green-200 bg-green-50 text-green-700" }
      case "processing":
        return { label: "Processing", className: "border-blue-200 bg-blue-50 text-blue-700" }
      case "failed":
        return { label: "Failed", className: "border-red-200 bg-red-50 text-red-700" }
      case "disputed":
        return { label: "Disputed", className: "border-orange-200 bg-orange-50 text-orange-700" }
      case "rejected":
        return { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700" }
      case "pending":
      default:
        return { label: "Pending", className: "border-yellow-200 bg-yellow-50 text-yellow-700" }
    }
  }
  
  // Handle standard verification/registration statuses
  switch (status) {
    case "approved":
      return { label: "Approved", className: "border-green-200 bg-green-50 text-green-700" }
    case "rejected":
      return { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700" }
    default:
      return { label: "Pending", className: "border-yellow-200 bg-yellow-50 text-yellow-700" }
  }
}

const getTypeLabel = (docType: string) => {
  switch (docType) {
    case "driver_license":
      return "Account Verification (Driver License)"
    case "passport":
      return "Account Verification (Passport)"
    case "id_card":
      return "Account Verification (National ID)"
    case "business_license":
      return "Business Permit"
    case "vehicle_registration":
      return "Vehicle Registration"
    case "payout_failed":
      return "Failed Payout"
    case "refund_request":
      return "Refund Request"
    case "reactivation_request":
      return "Account Reactivation"
    default:
      return "Account Verification"
  }
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

export default function VerificationRequestsTable({ requests }: VerificationRequestsTableProps) {
  const columns: ColumnDef<VerificationRequest>[] = useMemo(() => [
    {
      header: "Requester",
      accessorKey: "user.name",
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[220px]">
          {row.original.doc_type === "payout_failed" ? "Stripe" : (row.original.user?.name || `User ${row.original.user_id}`)}
        </div>
      ),
      size: 220,
    },
    {
      header: "Type",
      accessorKey: "doc_type",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{getTypeLabel(row.original.doc_type)}</div>
      ),
      size: 220,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const b = getStatusBadge(row.original.status, row.original.doc_type)
        return (
          <Badge variant="outline" className={b.className}>
            {b.label}
          </Badge>
        )
      },
      size: 140,
    },
    {
      header: "Submitted",
      accessorKey: "submitted_at",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.original.submitted_at)}</div>
      ),
      size: 200,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link prefetch={false} href={`/admin/verification-requests/request-body/${encodeId(row.original.verification_id)}`}>
                <span className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 100,
    },
  ], [])

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      {table.getRowModel().rows?.length ? (
        <div className="border-x border-b border-neutral-300 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="px-4"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
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
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 55h60v35H30z" fill="none" />
              <path d="M30 55l15-15h30l15 15" fill="none" />
              <path d="M45 40l15 15M75 40L60 55" fill="none" />
            </g>
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No verification requests</h3>
          <p className="text-sm text-muted-foreground">No items match the current filters</p>
        </div>
      )}
    </div>
  )
}


