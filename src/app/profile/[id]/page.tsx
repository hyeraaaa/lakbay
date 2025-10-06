"use client"
import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { decodeId } from '@/lib/idCodec'
import ReviewsSection from '@/components/vehicle-booking/ReviewsSection'
import LocationSection from '@/components/map/LocationSection'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton'
import VerifiedInfo from '@/components/profile/VerifiedInfo'
import ShareActions from '@/components/profile/ShareActions'
import VehiclesList from '@/components/profile/VehiclesList'
import { usePublicProfile } from '@/hooks/Profile/usePublicProfile'
import { useOwnerVehicles } from '@/hooks/Profile/useOwnerVehicles'
import { useAggregatedReviews } from '@/hooks/Profile/useAggregatedReviews'
import { useMapVehicle } from '@/hooks/Profile/useMapVehicle'

// Use the shared VehicleMap used across the app

export default function Page() {
  const params = useParams<{ id: string }>()
  const encodedUserId = params?.id as string
  const userId = useMemo(() => decodeId(encodedUserId) || '', [encodedUserId])

  const { profile, isLoadingProfile } = usePublicProfile(userId)
  const { vehicles, isLoadingVehicles, showAllVehicles, hasMoreVehicles, handleViewAllVehicles } = useOwnerVehicles(userId, 4)
  const { reviews, reviewsError } = useAggregatedReviews(userId)
  const { mapVehicle } = useMapVehicle(userId)

  if (isLoadingProfile || isLoadingVehicles) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Left: Profile summary */}
          <aside className="md:col-span-3">
            <ProfileHeader profile={profile} userId={userId} />

            <VerifiedInfo email={profile?.email} phone={profile?.phone} />

            <ShareActions />

          {/* Reviews from this owner's vehicles */}
          <div className="mt-8">
            <ReviewsSection reviews={reviews} reviewsError={reviewsError} />
          </div>

          {/* Location map removed */}
          </aside>

          {/* Right: Vehicles list */}
          <main className="md:col-span-2">
            <VehiclesList
              vehicles={vehicles}
              isLoadingVehicles={isLoadingVehicles}
              hasMoreVehicles={hasMoreVehicles}
              showAllVehicles={showAllVehicles}
              onViewAll={handleViewAllVehicles}
            />
          </main>
        </div>

        {/* Garage Location Map */}
        <LocationSection vehicle={mapVehicle} />
      </div>
    </div>
  )
}
