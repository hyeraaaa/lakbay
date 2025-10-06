"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { vehicleService, type VehicleResponse, type VehicleReview } from "@/services/vehicleServices"
import { bookingService, BookingStatus } from "@/services/bookingServices"
import { decodeId } from "@/lib/idCodec"

export function useVehicleDetails() {
  const params = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<VehicleReview[] | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [tripCount, setTripCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.id) return
        setIsLoading(true)

        const decodedId = decodeId(params.id as string)
        if (!decodedId) {
          setError("Invalid vehicle ID")
          return
        }

        const data = await vehicleService.getVehicleById(Number(decodedId))
        setVehicle(data)

        try {
          const rvw = await vehicleService.getVehicleReviews(Number(decodedId))
          setReviews(rvw)
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : "Failed to load reviews";
          setReviewsError(errorMessage);
        }

        try {
          const bookingsResp = await bookingService.listBookings({ vehicle_id: Number(decodedId), status: BookingStatus.COMPLETED, limit: 100 })
          const completedTrips = (bookingsResp.bookings || []).filter(b => b.status === BookingStatus.COMPLETED).length
          setTripCount(completedTrips)
        } catch (_) {
          setTripCount(0)
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load vehicle";
        setError(errorMessage);
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [params?.id])

  return { vehicle, isLoading, error, reviews, reviewsError, tripCount }
}


