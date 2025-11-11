"use client"

import { useMemo } from 'react'
import { type ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
 
import { MoreHorizontal, CheckCircle, XCircle, Ban, Edit } from 'lucide-react'
import type { AdminUserSummary } from '@/services/adminUserService'

type UsersDataTableProps = {
  users: AdminUserSummary[]
  onAction: (action: 'view' | 'edit' | 'activate' | 'deactivate' | 'ban', userId: number) => void
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

const getUserTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'customer': return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'owner': return 'border-green-200 bg-green-50 text-green-700'
    case 'admin': return 'border-purple-200 bg-purple-50 text-purple-700'
    default: return 'border-gray-200 bg-gray-50 text-gray-700'
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return { className: 'border-green-200 bg-green-50 text-green-700' }
    case 'deactivated': return { className: 'border-red-200 bg-red-50 text-red-700' }
    case 'banned': return { className: 'border-red-300 bg-red-100 text-red-800' }
    case 'pending': return { className: 'border-yellow-200 bg-yellow-50 text-yellow-700' }
    default: return { className: 'border-gray-200 bg-gray-50 text-gray-700' }
  }
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default function UsersDataTable({ users, onAction, page, totalPages, totalItems, pageSize, onPageChange }: UsersDataTableProps) {
  const columns: ColumnDef<AdminUserSummary>[] = useMemo(() => [
    {
      header: "Name",
      accessorKey: "first_name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
      ),
      size: 200,
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.email}</div>
      ),
      size: 250,
    },
    {
      header: "Username",
      accessorKey: "username",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.username || '-'}</div>
      ),
      size: 150,
    },
    {
      header: "Type",
      accessorKey: "user_type",
      cell: ({ row }) => {
        const colorClass = getUserTypeColor(row.original.user_type)
        return (
          <Badge variant="outline" className={colorClass}>
            {capitalize(row.original.user_type)}
          </Badge>
        )
      },
      size: 120,
    },
    {
      header: "Status",
      accessorKey: "account_status",
      cell: ({ row }) => {
        const statusColor = getStatusColor(row.original.account_status)
        return (
          <Badge variant="outline" className={statusColor.className}>
            {capitalize(row.original.account_status)}
          </Badge>
        )
      },
      size: 120,
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
      size: 120,
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
            <DropdownMenuItem onClick={() => onAction('edit', row.original.user_id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.original.account_status.toLowerCase() !== 'active' && (
              <DropdownMenuItem onClick={() => onAction('activate', row.original.user_id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            {row.original.account_status.toLowerCase() === 'active' && (
              <DropdownMenuItem onClick={() => onAction('deactivate', row.original.user_id)}>
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onAction('ban', row.original.user_id)}
              className="text-red-600"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 80,
    },
  ], [onAction])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      {table.getRowModel().rows?.length ? (
        <div className="border border-neutral-300 bg-white">
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
            <circle cx="60" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M40 90L60 70L80 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No users found</h3>
          <p className="text-sm text-muted-foreground">No users match the current filters</p>
        </div>
      )}

      
    </div>
  )
}

