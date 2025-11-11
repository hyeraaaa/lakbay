"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useJWT } from "@/contexts/JWTContext";
import { BookingFilters, BookingStatus, bookingService } from "@/services/bookingServices";
import { useOwnerBookings } from "@/hooks/booking/useOwnerBookings";
import { useNotification } from "@/components/NotificationProvider";
import { encodeId } from "@/lib/idCodec";

export type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

export const useOwnerBookingsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  // Use global notification provider for success/error toasts

  const { user, isAuthenticated, isLoading: authLoading } = useJWT();
  const router = useRouter();
  const { success, error: notifyError } = useNotification();

  const {
    bookings,
    isLoading,
    isStatsLoading,
    error,
    filters,
    pagination,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters,
    setError,
    allBookings,
    updateBookingLocal,
  } = useOwnerBookings();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
    async (action: string, bookingId: number) => {
      const actionKey = `${action}-${bookingId}`;
      try {
        setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

        switch (action) {
          case "approve":
            await bookingService.approveBooking(bookingId);
            success("Booking approved successfully!");
            updateBookingLocal(bookingId, (b) => ({ ...b, status: BookingStatus.PENDING_PAYMENT }));
            break;
          case "checkout":
            await bookingService.checkOut(bookingId);
            success("Checked out successfully");
            updateBookingLocal(bookingId, (b) => ({ ...b, status: BookingStatus.ON_GOING }));
            break;
          case "checkin":
            await bookingService.checkIn(bookingId);
            success("Checked in successfully");
            updateBookingLocal(bookingId, (b) => ({ ...b, status: BookingStatus.COMPLETED }));
            break;
          case "complete":
            await bookingService.completeBooking(bookingId);
            success("Booking completed successfully");
            updateBookingLocal(bookingId, (b) => ({ ...b, status: BookingStatus.COMPLETED }));
            break;
          case "view":
            router.push(`/owner/bookings/booking-details/${encodeId(bookingId.toString())}`);
            break;
          default:
            break;
        }
      } catch (error: unknown) {
        console.error(`Error in ${action} for booking ${bookingId}:`, error);
        const errorMessage = error instanceof Error ? error.message : `${action} failed`;
        notifyError(errorMessage);
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [router, notifyError, success, updateBookingLocal]
  );

  const handleAlert = useCallback((message: string, _variant: AlertVariant) => {
    success(message);
  }, [success]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    clearFilters();
  }, [clearFilters]);

  const statusCounts = useMemo(() => {
    // Use full dataset for stats (not filtered by UI filters)
    const source = allBookings || [];
    if (!source) {
      return {
        total: 0,
        pending: 0,
        awaiting: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        canceled: 0,
      };
    }
    return {
      total: source.length,
      pending: source.filter((b) => b.status === BookingStatus.PENDING_PAYMENT).length,
      awaiting: source.filter((b) => b.status === BookingStatus.AWAITING_OWNER_APPROVAL).length,
      confirmed: source.filter((b) => b.status === BookingStatus.CONFIRMED).length,
      ongoing: source.filter((b) => b.status === BookingStatus.ON_GOING).length,
      completed: source.filter((b) => b.status === BookingStatus.COMPLETED).length,
      canceled: source.filter((b) => b.status === BookingStatus.CANCELED).length,
    };
  }, [allBookings]);

  const statusOptions = useMemo(
    () => [
      { value: "all" as const, label: "All" },
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
    isAuthenticated,
    authLoading,
    user,
    // local state
    searchQuery,
    statusFilter,
    showFilters,
    actionLoading,
    setShowFilters,
    
    // data
    bookings,
    isLoading,
    isStatsLoading,
    error,
    filters,
    pagination,
    statusCounts,
    statusOptions,
    // actions
    handleSearch,
    handleStatusFilter,
    handleRefresh,
    handleBookingAction,
    handleAlert,
    updateFilters,
    refreshBookings,
    goToPage,
    clearFilters: handleClearFilters,
    setError,
  };
};

export default useOwnerBookingsPage;


