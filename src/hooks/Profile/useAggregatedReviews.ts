import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { vehicleService, type VehicleReview } from '@/services/vehicleServices'

export function useAggregatedReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<VehicleReview[] | null>(null)
  const [reviewsAll, setReviewsAll] = useState<VehicleReview[] | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const currentRating = useMemo(() => {
    const r = searchParams?.get('rating')
    const n = r ? parseInt(r) : NaN
    return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    const loadReviews = async () => {
      try {
        setReviewsError(null)
        setReviews(null)
        setReviewsAll(null)
        if (!userId) return
        const allVehicles = await vehicleService.getAllVehicles({ owner_id: userId })
        const ids = (Array.isArray(allVehicles) ? allVehicles : []).map(v => v.vehicle_id)
        if (ids.length === 0) {
          setReviews([])
          setReviewsAll([])
          return
        }
        // Always fetch unfiltered for stable stats/progress bars
        const results = await Promise.allSettled(ids.map(id => vehicleService.getVehicleReviews(id)))
        if (cancelled) return
        const merged: VehicleReview[] = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
        merged.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0
          const db = b.created_at ? new Date(b.created_at).getTime() : 0
          return db - da
        })
        setReviewsAll(merged)
        // Apply initial filter if present
        if (currentRating) {
          setReviews(merged.filter(r => r.rating === currentRating))
        } else {
          setReviews(merged)
        }
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

  // Re-apply filter when query param changes without refetching
  useEffect(() => {
    if (!reviewsAll) return
    if (currentRating) {
      setReviews(reviewsAll.filter(r => r.rating === currentRating))
    } else {
      setReviews(reviewsAll)
    }
  }, [currentRating, reviewsAll])

  return { reviews, reviewsAll, reviewsError }
}

 