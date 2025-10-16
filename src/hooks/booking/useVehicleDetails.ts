"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { vehicleService, type VehicleResponse, type VehicleReview } from "@/services/vehicleServices"
import { bookingService, BookingStatus } from "@/services/bookingServices"
import { decodeId } from "@/lib/idCodec"

export function useVehicleDetails() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<VehicleReview[] | null>(null)
  const [reviewsAll, setReviewsAll] = useState<VehicleReview[] | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [tripCount, setTripCount] = useState<number>(0)

  // Load vehicle and trip count on id changes
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

  // Load filtered reviews when rating param changes
  useEffect(() => {
    const loadFiltered = async () => {
      try {
        if (!params?.id) return
        const decodedId = decodeId(params.id as string)
        if (!decodedId) return
        const ratingParam = searchParams?.get("rating")
        const rating = ratingParam ? parseInt(ratingParam) : undefined
        const filtered = await vehicleService.getVehicleReviews(Number(decodedId), { rating: Number.isFinite(rating as number) ? rating : undefined })
        setReviews(filtered)
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load reviews";
        setReviewsError(errorMessage);
      }
    }
    loadFiltered()
  }, [params?.id, searchParams])

  // Load unfiltered reviews only when id changes (for stable stats/bars)
  useEffect(() => {
    const loadAll = async () => {
      try {
        if (!params?.id) return
        const decodedId = decodeId(params.id as string)
        if (!decodedId) return
        const all = await vehicleService.getVehicleReviews(Number(decodedId))
        setReviewsAll(all)
      } catch (_) {
        setReviewsAll(null)
      }
    }
    loadAll()
  }, [params?.id])

  return { vehicle, isLoading, error, reviews, reviewsAll, reviewsError, tripCount }
}


