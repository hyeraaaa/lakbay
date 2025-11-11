"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export const VerificationRequestDetailSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <header className="border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {/* Document info skeleton */}
          <div className="text-sm text-gray-600">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Documents grid skeleton */}
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="w-16 h-16 relative mb-2">
                  <Skeleton className="w-16 h-16 rounded" />
                </div>
                <div className="text-xs text-gray-600">
                  <Skeleton className="h-3 w-20 mb-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>

          {/* Review notes skeleton */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationRequestDetailSkeleton
