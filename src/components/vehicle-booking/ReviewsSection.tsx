"use client"

import { useEffect, useRef } from "react"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getProfileImageUrl } from "@/lib/imageUtils"
import type { VehicleReview } from "@/services/vehicleServices"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type ReviewsSectionProps = {
  reviews: VehicleReview[] | null
  reviewsError: string | null
  reviewsAll?: VehicleReview[] | null
}

export default function ReviewsSection({ reviews, reviewsError, reviewsAll }: ReviewsSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRating = (() => {
    const r = searchParams?.get("rating")
    const n = r ? parseInt(r) : NaN
    return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null
  })()

  const setRating = (rating: number | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (rating && rating >= 1 && rating <= 5) {
      params.set("rating", String(rating))
    } else {
      params.delete("rating")
    }
    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  // Persist the unfiltered review set so the progress bars remain visible during filtering
  const baseAllReviewsRef = useRef<VehicleReview[] | null>(null)
  useEffect(() => {
    if (!baseAllReviewsRef.current) {
      if (reviewsAll && reviewsAll.length > 0) {
        baseAllReviewsRef.current = reviewsAll
      } else if (reviews && reviews.length > 0) {
        baseAllReviewsRef.current = reviews
      }
    }
  }, [reviewsAll, reviews])

  const ratingStatsSource =
    baseAllReviewsRef.current && baseAllReviewsRef.current.length > 0
      ? baseAllReviewsRef.current
      : reviewsAll && reviewsAll.length > 0
        ? reviewsAll
        : reviews
  const ratingStats =
    ratingStatsSource && ratingStatsSource.length > 0
      ? (() => {
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          let totalRating = 0

          ratingStatsSource.forEach((review) => {
            counts[review.rating as keyof typeof counts]++
            totalRating += review.rating
          })

          const averageRating = totalRating / ratingStatsSource.length
          const totalReviews = ratingStatsSource.length

          return { counts, averageRating, totalReviews }
        })()
      : null

  return (
    <div className="border-gray-300 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Ratings and Reviews</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
              {currentRating ? `${currentRating} star${currentRating > 1 ? "s" : ""}` : "All ratings"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-2">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start" onClick={() => setRating(null)}>
                All ratings
              </Button>
              {[5,4,3,2,1].map(star => (
                <Button key={star} variant="ghost" className="justify-start gap-2" onClick={() => setRating(star)}>
                  <span className="inline-flex items-center gap-1">
                    {star}
                    <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {reviewsError && <p className="text-sm text-red-600">{reviewsError}</p>}
      {/* Loading state removed; parent page shows a skeleton */}

      {ratingStats && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average Rating Display */}
            <div className="flex flex-col items-center justify-center md:border-r md:pr-8 md:min-w-[200px]">
              <div className="text-5xl font-bold text-gray-900">{ratingStats.averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(ratingStats.averageRating) ? "fill-blue-500 text-blue-500" : "text-blue-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution Bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.counts[star as keyof typeof ratingStats.counts]
                const percentage = (count / ratingStats.totalReviews) * 100

                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[60px]">
                      <span className="text-sm font-medium text-gray-700">{star}</span>
                      <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                    </div>
                    <div className="flex-1">
                    <Progress value={percentage} className="h-2 [&>div]:bg-blue-500" />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[40px] text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    {(() => {
        const ratingParam = searchParams?.get("rating")
        const hasFilter = !!ratingParam
        if (reviews && reviews.length === 0) {
          return (
            <p className="text-sm text-gray-600">
              {hasFilter ? "No reviews match this rating." : "No reviews yet."}
            </p>
          )
        }
        return null
      })()}

      {reviews && reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((r, idx) => {
            const displayName = r.users ? `${r.users.first_name} ${r.users.last_name}` : "Guest"
            const initials = displayName.trim().charAt(0).toUpperCase() || "G"
            const reviewDate = r.created_at
              ? new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
              : ""
            return (
              <div key={r.review_id}>
                <div className="flex items-start gap-4 pt-5">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getProfileImageUrl(r.users?.profile_picture) || "/placeholder.svg"}
                      alt={displayName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 text-blue-500 ${i < r.rating ? "fill-blue-500" : ""}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {displayName}
                      {reviewDate && <span className="text-gray-500 font-normal"> • {reviewDate}</span>}
                    </div>
                    {r.comment && <p className="mt-3 text-gray-800 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
                {idx !== reviews.length - 1 && <div className="mt-4 border-b border-neutral-200" />}
              </div>
            )
          })}

          
        </div>
      )}
    </div>
  )
}
