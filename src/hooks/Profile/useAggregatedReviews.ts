import { useEffect, useState } from 'react'
import { vehicleService, type VehicleReview } from '@/services/vehicleServices'

export function useAggregatedReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<VehicleReview[] | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadReviews = async () => {
      try {
        setReviewsError(null)
        setReviews(null)
        if (!userId) return
        const allVehicles = await vehicleService.getAllVehicles({ owner_id: userId })
        const ids = (Array.isArray(allVehicles) ? allVehicles : []).map(v => v.vehicle_id)
        if (ids.length === 0) {
          setReviews([])
          return
        }
        const results = await Promise.allSettled(ids.map(id => vehicleService.getVehicleReviews(id)))
        if (cancelled) return
        const merged: VehicleReview[] = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
        merged.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0
          const db = b.created_at ? new Date(b.created_at).getTime() : 0
          return db - da
        })
        setReviews(merged)
      } catch (e: unknown) {
        if (!cancelled) {
          const errorMessage = e instanceof Error ? e.message : 'Failed to load reviews'
          setReviewsError(errorMessage)
        }
      }
    }
    loadReviews()
    return () => { cancelled = true }
  }, [userId])

  return { reviews, reviewsError }
}

 