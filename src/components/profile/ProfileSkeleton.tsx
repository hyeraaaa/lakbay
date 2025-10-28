"use client"
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileSkeleton() {
  return (
    <div className="bg-[#fafafc]">
      <div className='mx-auto max-w-7xl py-8 px-4'>
        {/* ProfileHeader skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          
          {/* ShareActions skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="w-full space-y-8">
          <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted rounded-lg mb-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Tab content skeleton - Overview */}
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Reviews Section skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>

              {/* Business Hours skeleton */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40 mb-4" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


