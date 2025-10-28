import { useMemo } from 'react'
import { type ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, User, Car } from 'lucide-react'
import type { Report } from '@/types/report'
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

type ColorResult = {
  variant: BadgeVariant
  className: string
}

type ReportsTableProps = {
  reports: Report[]
  loading: boolean
  onViewEntity: (report: Report) => void
  onEditReport: (report: Report) => void
}

const getPriorityColor = (priority: string): ColorResult => {
  switch (priority) {
    case 'urgent': return { variant: 'destructive', className: 'border-red-600 bg-red-100 text-red-800' }
    case 'high': return { variant: 'outline', className: 'border-red-300 bg-red-50 text-red-700' }
    case 'medium': return { variant: 'outline', className: 'border-orange-200 bg-orange-50 text-orange-700' }
    case 'low': return { variant: 'outline', className: 'border-blue-200 bg-blue-50 text-blue-700' }
    default: return { variant: 'default', className: '' }
  }
}

const getStatusColor = (status: string): ColorResult => {
  switch (status) {
    case 'pending': return { variant: 'outline', className: 'border-yellow-200 bg-yellow-50 text-yellow-700' }
    case 'under_review': return { variant: 'outline', className: 'border-blue-200 bg-blue-50 text-blue-700' }
    case 'resolved': return { variant: 'outline', className: 'border-green-200 bg-green-50 text-green-700' }
    case 'dismissed': return { variant: 'outline', className: 'border-gray-200 bg-gray-50 text-gray-700' }
    default: return { variant: 'default', className: '' }
  }
}

const formatCategory = (category: string | null | undefined) => {
  if (!category) return '-'
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getCategoryColor = (category: string | null | undefined): ColorResult => {
  if (!category) {
    return { variant: 'outline', className: 'border-gray-200 bg-gray-50 text-gray-700' }
  }
  
  const cat = category.toLowerCase()
  
  // Color map for different category types
  const colorMap: Record<string, string> = {
    // User categories
    'inappropriate_behavior': 'border-red-200 bg-red-50 text-red-700',
    'fraud': 'border-orange-200 bg-orange-50 text-orange-700',
    'harassment': 'border-pink-200 bg-pink-50 text-pink-700',
    'safety_concern': 'border-yellow-200 bg-yellow-50 text-yellow-700',
    'safety': 'border-yellow-200 bg-yellow-50 text-yellow-700',
    'scam': 'border-red-300 bg-red-50 text-red-800',
    'spam': 'border-gray-200 bg-gray-50 text-gray-700',
    'fake_profile': 'border-purple-200 bg-purple-50 text-purple-700',
    'fake': 'border-purple-200 bg-purple-50 text-purple-700',
    
    // Vehicle categories
    'vehicle': 'border-blue-200 bg-blue-50 text-blue-700',
    'vehicle_damage': 'border-orange-200 bg-orange-50 text-orange-700',
    'vehicle_safety': 'border-yellow-200 bg-yellow-50 text-yellow-700',
    'vehicle_condition': 'border-amber-200 bg-amber-50 text-amber-700',
    'vehicle_fraud': 'border-red-200 bg-red-50 text-red-700',
    'mechanical_issue': 'border-red-300 bg-red-50 text-red-800',
    'safety_issue': 'border-yellow-300 bg-yellow-50 text-yellow-800',
    
    // Default patterns
    'suspicious': 'border-orange-300 bg-orange-50 text-orange-800',
    'inappropriate': 'border-pink-300 bg-pink-50 text-pink-800',
    'violation': 'border-red-300 bg-red-50 text-red-800',
  }
  
  // Try to find matching color by exact match first
  if (colorMap[cat]) {
    return { variant: 'outline', className: colorMap[cat] }
  }
  
  // Try partial match
  for (const [key, color] of Object.entries(colorMap)) {
    if (cat.includes(key)) {
      return { variant: 'outline', className: color }
    }
  }
  
  // Fallback: assign color based on category hash for consistent distinct colors
  const colors = [
    'border-indigo-200 bg-indigo-50 text-indigo-700',
    'border-violet-200 bg-violet-50 text-violet-700',
    'border-cyan-200 bg-cyan-50 text-cyan-700',
    'border-emerald-200 bg-emerald-50 text-emerald-700',
    'border-lime-200 bg-lime-50 text-lime-700',
    'border-teal-200 bg-teal-50 text-teal-700',
  ]
  
  // Simple hash to get consistent color for same category
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = ((hash << 5) - hash) + cat.charCodeAt(i)
    hash = hash & hash
  }
  const colorIndex = Math.abs(hash) % colors.length
  
  return { variant: 'outline', className: colors[colorIndex] }
}

export function ReportsTable({ reports, loading, onViewEntity, onEditReport }: ReportsTableProps) {
  const columns: ColumnDef<Report>[] = useMemo(() => [
    {
      header: "Type",
      accessorKey: "reported_entity_type",
      cell: ({ row }) => {
        const type = row.original.reported_entity_type.toLowerCase()
        const colorClass = type === 'user' 
          ? 'border-blue-200 bg-blue-50 text-blue-700' 
          : 'border-purple-200 bg-purple-50 text-purple-700'
        return (
          <Badge variant="outline" className={colorClass}>
            {row.original.reported_entity_type}
          </Badge>
        )
      },
      size: 100,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const statusColor = getStatusColor(row.original.status)
        return (
          <Badge variant={statusColor.variant} className={statusColor.className}>
            {row.original.status}
          </Badge>
        )
      },
      size: 120,
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: ({ row }) => {
        const priorityColor = getPriorityColor(row.original.priority)
        return (
          <Badge variant={priorityColor.variant} className={priorityColor.className}>
            {row.original.priority}
          </Badge>
        )
      },
      size: 120,
    },
    {
      header: "Category",
      id: "category",
      cell: ({ row }) => {
        const category = row.original.user_category || row.original.vehicle_category
        const categoryColor = getCategoryColor(category)
        return (
          <Badge variant={categoryColor.variant} className={categoryColor.className}>
            {formatCategory(category)}
          </Badge>
        )
      },
      size: 150,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="max-w-2xl truncate">
          {row.original.description || '-'}
        </div>
      ),
      size: 300,
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: ({ row }) => (
        new Date(row.original.created_at).toLocaleDateString()
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
            <DropdownMenuItem onClick={() => onViewEntity(row.original)}>
              {row.original.reported_entity_type === 'user' ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </>
              ) : (
                <>
                  <Car className="mr-2 h-4 w-4" />
                  View Vehicle
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditReport(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 80,
    },
  ], [onViewEntity, onEditReport])

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    table.getRowModel().rows?.length ? (
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center px-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    ) : loading ? (
      <div className="rounded-sm border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
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
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center px-4">
                  Loading...
                </TableCell>
              </TableRow>
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
          <rect x="20" y="20" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="35" cy="40" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M30 55H70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 70H70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="85" cy="40" r="3" fill="currentColor" opacity="0.3" />
          <path d="M83 38L87 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-1">No reports found</h3>
        <p className="text-sm text-muted-foreground">Reports will appear here once users submit issues</p>
      </div>
    )
  )
}

