"use client"

export default function VehicleDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      {/* Gallery skeleton */}
      <div className="lg:col-span-3 mb-6">
        <div className="h-64 md:h-80 lg:h-96 w-full bg-gray-200 rounded-md" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and stats */}
          <div>
            <div className="h-8 w-2/3 bg-gray-200 rounded mb-3" />
            <div className="flex items-center gap-4 mb-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="h-7 w-24 bg-gray-200 rounded" />
              <div className="h-7 w-28 bg-gray-200 rounded" />
              <div className="h-7 w-32 bg-gray-200 rounded" />
              <div className="h-7 w-40 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Host section skeleton */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="border-t pt-6">
            <div className="space-y-2">
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
              <div className="h-4 w-3/6 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Features skeleton */}
          <div className="border-t pt-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-7 w-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton (Booking Sidebar look-alike) */}
        <div>
          <div className="sticky top-6">
            <div className="border rounded-md p-6 bg-white shadow-sm">
              {/* Price */}
              <div className="mb-6">
                <div className="h-7 w-40 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>

              {/* Your trip header */}
              <div className="pt-4 border-t mb-4">
                <div className="h-6 w-28 bg-gray-200 rounded mb-4" />
                {/* Trip start */}
                <div className="mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
                {/* Trip end */}
                <div className="mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
                {/* Pickup */}
                <div className="mb-4">
                  <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                {/* Drop-off */}
                <div className="mb-6">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                {/* Continue button */}
                <div className="h-11 w-full bg-gray-200 rounded mb-4" />
              </div>

              {/* Availability info */}
              <div className="mb-4 p-3 border rounded-md">
                <div className="h-4 w-56 bg-gray-200 rounded" />
              </div>

              {/* Policies */}
              <div className="pt-4 border-t space-y-4">
                <div>
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-64 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-72 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map skeleton */}
      <div className="mt-10">
        <div className="h-8 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-[22rem] md:h-[28rem] lg:h-[34rem] w-full bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}


