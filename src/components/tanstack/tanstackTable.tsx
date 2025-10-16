"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type FeatureFlag = {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "deprecated"
  environment: string
  type: "boolean" | "string" | "number"
  owner: {
    name: string
    avatar: string
  }
  lastUpdated: string
  usage: number
}

const data: FeatureFlag[] = [
  {
    id: "1",
    name: "v0ChatModelOverride",
    description: "Anthropic Sonnet 3.7, Cross Region Bedrock Sonnet 3.5",
    status: "active",
    environment: "Production",
    type: "string",
    owner: { name: "Alex Chen", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "2 hours ago",
    usage: 94,
  },
  {
    id: "2",
    name: "v0WebsiteVisionEnabled",
    description: "Enable vision capabilities for website analysis",
    status: "active",
    environment: "Production",
    type: "boolean",
    owner: { name: "Sarah Kim", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "5 hours ago",
    usage: 78,
  },
  {
    id: "3",
    name: "v0AutoFixRewriteModel",
    description: "Model selection for auto-fix rewrites",
    status: "active",
    environment: "Preview",
    type: "string",
    owner: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "1 day ago",
    usage: 45,
  },
  {
    id: "4",
    name: "gitBidirectionalSyncEnabled",
    description: "Enable bidirectional Git synchronization",
    status: "inactive",
    environment: "Development",
    type: "boolean",
    owner: { name: "Emma Davis", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "3 days ago",
    usage: 12,
  },
  {
    id: "5",
    name: "blockLoaderEnabled",
    description: "Enable new block loader architecture",
    status: "deprecated",
    environment: "Production",
    type: "boolean",
    owner: { name: "James Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "1 week ago",
    usage: 5,
  },
  {
    id: "6",
    name: "hydrateMessageContent",
    description: "Hydrate message content on initial load",
    status: "inactive",
    environment: "Preview",
    type: "boolean",
    owner: { name: "Lisa Anderson", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "4 days ago",
    usage: 23,
  },
  {
    id: "7",
    name: "vscodeEnabled",
    description: "Enable VS Code integration features",
    status: "active",
    environment: "Production",
    type: "boolean",
    owner: { name: "Tom Martinez", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "6 hours ago",
    usage: 89,
  },
  {
    id: "8",
    name: "v0ChatDiffsEnabled",
    description: "Show code diffs in chat interface",
    status: "active",
    environment: "Preview",
    type: "boolean",
    owner: { name: "Nina Patel", avatar: "/placeholder.svg?height=32&width=32" },
    lastUpdated: "12 hours ago",
    usage: 67,
  },
]

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<FeatureFlag>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-accent"
          >
            <span className="font-medium">Flag Name</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-2 w-2 rounded-full ${
                status === "active" ? "bg-success" : status === "inactive" ? "bg-muted-foreground" : "bg-warning"
              }`}
            />
            <span className="font-mono text-sm font-medium">{row.getValue("name")}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-md text-sm text-muted-foreground">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "environment",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-accent"
          >
            <span className="font-medium">Environment</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const env = row.getValue("environment") as string
        return (
          <Badge variant={env === "Production" ? "default" : "secondary"} className="font-mono text-xs">
            {env}
          </Badge>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("type")}</span>,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.getValue("owner") as { name: string; avatar: string }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={owner.avatar || "/placeholder.svg"} alt={owner.name} />
              <AvatarFallback className="text-xs">
                {owner.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{owner.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "usage",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-accent"
          >
            <span className="font-medium">Usage</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const usage = row.getValue("usage") as number
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${usage}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{usage}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue("lastUpdated")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit flag</DropdownMenuItem>
              <DropdownMenuItem>View history</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter feature flags..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border transition-colors hover:bg-accent/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
