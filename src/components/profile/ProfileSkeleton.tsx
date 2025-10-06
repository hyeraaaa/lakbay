"use client"
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Left: Profile summary skeleton */}
          <aside className="md:col-span-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-36" />
            </div>

            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
            </div>

            <div className="mt-8 space-y-3">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Vehicles list skeleton */}
          <main className="md:col-span-2">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-20 w-28" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Garage Location Map skeleton */}
        <div className="mt-10">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}


