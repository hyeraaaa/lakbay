"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { BookingCard } from "@/components/booking/BookingCard";
import { BookingStatus } from "@/services/bookingServices";

type Booking = Parameters<typeof BookingCard>[0]["booking"]; // infer from BookingCard props

type Props = {
  isLoading: boolean;
  bookings?: Booking[] | null;
  searchQuery: string;
  statusFilter: BookingStatus | "all";
  onClearFilters: () => void;
  onAction: (action: string, bookingId: number) => void;
  onAlert: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void;
};

export const BookingsList: React.FC<Props> = ({
  isLoading,
  bookings,
  searchQuery,
  statusFilter,
  onClearFilters,
  onAction,
  onAlert,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-white rounded-xl border border-border overflow-hidden"
          >
            {/* Desktop/Tablet skeleton: horizontal card */}
            <div className="hidden sm:flex h-32">
              {/* Image placeholder */}
              <div className="w-40 flex-shrink-0 relative">
                <Skeleton className="w-full h-full" />
              </div>
              {/* Right content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-20 ml-auto" />
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile skeleton: vertical card */}
            <div className="sm:hidden">
              <div className="relative">
                <Skeleton className="w-full h-48" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <div className="text-right ml-3 space-y-2">
                    <Skeleton className="h-5 w-24 ml-auto" />
                    <Skeleton className="h-3 w-14 ml-auto" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-28" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search criteria or filters."
              : "You haven't made any bookings yet."}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.booking_id} booking={booking} onAction={onAction} onAlert={onAlert} />
      ))}
    </div>
  );
};

export default BookingsList;


