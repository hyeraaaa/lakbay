import { Skeleton } from '@/components/ui/skeleton'

export function ReportFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-10 w-[180px]" />
      <Skeleton className="h-10 w-[180px]" />
      <Skeleton className="h-10 w-[180px]" />
    </div>
  )
}

