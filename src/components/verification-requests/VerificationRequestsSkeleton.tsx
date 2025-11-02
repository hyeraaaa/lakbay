"use client"

import { Skeleton } from "@/components/ui/skeleton"

export const VerificationRequestsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="border-x border-b border-neutral-300 bg-white">
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
  )
}

export default VerificationRequestsSkeleton
