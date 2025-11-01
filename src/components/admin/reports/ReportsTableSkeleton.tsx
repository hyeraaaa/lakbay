import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function ReportsTableSkeleton() {
  const columns = ['Type', 'Status', 'Priority', 'Category', 'Description', 'Created', 'Actions']
  const rows = 5 // Number of skeleton rows

  return (
    <div className="border border-neutral-300 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="px-4">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className="px-4">
                    {colIndex === columns.length - 1 ? (
                      <Skeleton className="h-8 w-8 rounded" />
                    ) : colIndex === 4 ? (
                      <Skeleton className="h-4 w-full max-w-2xl" />
                    ) : (
                      <Skeleton className="h-6 w-20" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

