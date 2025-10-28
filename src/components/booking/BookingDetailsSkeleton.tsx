import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BookingDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-20" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information Skeleton */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Image Skeleton */}
                <Skeleton className="h-64 w-full rounded-lg" />
                
                {/* Vehicle Details Skeleton */}
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details Skeleton */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Payment & Price Summary Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Status Skeleton */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                
                {/* Price Breakdown Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
