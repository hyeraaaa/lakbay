"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useJWT } from "@/contexts/JWTContext";
import { useUserBookings } from "@/hooks/booking/useUserBookings";
import { BookingFilters, BookingStatus } from "@/services/bookingServices";

export type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

export const useBookingsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const { user, isAuthenticated, isLoading: authLoading } = useJWT();
  const router = useRouter();

  const {
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError,
  } = useUserBookings();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateFilters({ q: query || undefined, page: 1 } as Partial<BookingFilters>);
    },
    [updateFilters]
  );

  const handleStatusFilter = useCallback(
    (status: BookingStatus | "all") => {
      setStatusFilter(status);
      updateFilters({ status: status === "all" ? undefined : status, page: 1 });
    },
    [updateFilters]
  );

  const handleRefresh = useCallback(() => {
    refreshBookings();
  }, [refreshBookings]);

  const handleBookingAction = useCallback(
    (action: string, bookingId: number) => {
      switch (action) {
        case "refresh":
          refreshBookings();
          break;
        case "view":
          router.push(`/user/bookings/booking-details/${bookingId}`);
          break;
        case "review":
          // Navigate to booking details with review context
          router.push(`/user/bookings/booking-details/${bookingId}?tab=review`);
          break;
        case "review":
          // Implement review flow here if needed
          break;
        default:
          break;
      }
    },
    [refreshBookings, router]
  );

  const handleAlert = useCallback((message: string, _variant: AlertVariant) => {
    // Placeholder for a real toast system
    console.log(message);
  }, []);

  const statusCounts = useMemo(() => {
    if (!bookings) {
      return { total: 0, pending: 0, confirmed: 0, ongoing: 0, completed: 0, canceled: 0 };
    }
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING_PAYMENT).length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
      ongoing: bookings.filter((b) => b.status === BookingStatus.ON_GOING).length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      canceled: bookings.filter((b) => b.status === BookingStatus.CANCELED).length,
    };
  }, [bookings]);

  const statusOptions = useMemo(
    () => [
      { value: "all" as const, label: "All Bookings" },
      { value: BookingStatus.PENDING_PAYMENT, label: "Pending Payment" },
      { value: BookingStatus.AWAITING_OWNER_APPROVAL, label: "Awaiting Approval" },
      { value: BookingStatus.CONFIRMED, label: "Confirmed" },
      { value: BookingStatus.ON_GOING, label: "On Going" },
      { value: BookingStatus.CANCELED, label: "Canceled" },
      { value: BookingStatus.COMPLETED, label: "Completed" },
    ],
    []
  );

  return {
    // auth
    user,
    isAuthenticated,
    authLoading,

    // state
    searchQuery,
    statusFilter,
    showFilters,

    // data
    bookings,
    isLoading,
    error,
    filters,
    pagination,
    statusCounts,
    statusOptions,

    // actions
    setShowFilters,
    handleSearch,
    handleStatusFilter,
    handleRefresh,
    handleBookingAction,
    handleAlert,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError,
  };
};

export type UseBookingsPageReturn = ReturnType<typeof useBookingsPage>;


