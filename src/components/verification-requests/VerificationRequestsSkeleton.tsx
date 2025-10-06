"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter } from "lucide-react"

export const VerificationRequestsSkeleton = () => {
  return (
    <div className="flex bg-background">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header skeleton */}
        <header className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Skeleton className="h-10 w-64 pl-10" />
              </div>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </header>

        {/* Action bar skeleton */}
        <div className="border-b border-border bg-card px-6 py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="flex-1 overflow-auto">
          <div>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-2 border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                </div>

                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Skeleton className="h-4 w-40" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-2 w-2 rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
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
