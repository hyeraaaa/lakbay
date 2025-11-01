"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter } from "lucide-react"

export const VerificationRequestsSkeleton = () => {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Stats grid skeleton (matches stats above the card) */}
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Card with header + table skeleton */}
      <div className="border rounded-md">
        {/* Header skeleton aligns to the right like the real header */}
        <header className="border-b border-border px-6 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Skeleton className="h-10 w-64 pl-10" />
              </div>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </header>

        {/* Table skeleton */}
        <div className="px-0">
          <div className="border border-neutral-300 bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                {/* Table header */}
                <div className="grid grid-cols-[220px_220px_140px_200px_100px] px-4 py-3 border-b">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Rows */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[220px_220px_140px_200px_100px] gap-x-0 px-4 py-3 border-b"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-24 rounded" />
                    <Skeleton className="h-4 w-28" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationRequestsSkeleton
