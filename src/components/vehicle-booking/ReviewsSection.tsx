"use client"

import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileImageUrl } from "@/lib/imageUtils"
import type { VehicleReview } from "@/services/vehicleServices"

type ReviewsSectionProps = {
  reviews: VehicleReview[] | null
  reviewsError: string | null
}

export default function ReviewsSection({ reviews, reviewsError }: ReviewsSectionProps) {
  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold text-lg mb-4">Reviews</h3>
      {reviewsError && (
        <p className="text-sm text-red-600">{reviewsError}</p>
      )}
      {/* Loading state removed; parent page shows a skeleton */}
      {reviews && reviews.length === 0 && (
        <p className="text-sm text-gray-600">No reviews yet.</p>
      )}
      {reviews && reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((r, idx) => {
            const displayName = r.users ? `${r.users.first_name} ${r.users.last_name}` : 'Guest';
            const initials = displayName.trim().charAt(0).toUpperCase() || 'G';
            const reviewDate = r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            return (
              <div key={r.review_id}>
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getProfileImageUrl(r.users?.profile_picture)} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 text-yellow-400 ${i < r.rating ? 'fill-yellow-400' : ''}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {displayName}
                      {reviewDate && <span className="text-gray-500 font-normal"> • {reviewDate}</span>}
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-gray-800 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                </div>
                {idx !== reviews.length - 1 && <div className="mt-4 border-b" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}


