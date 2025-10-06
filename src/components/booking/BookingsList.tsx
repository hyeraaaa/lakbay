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
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
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


