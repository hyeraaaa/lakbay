"use client"
import { useMemo } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { decodeId } from "@/lib/idCodec"
import ReviewsSection from "@/components/vehicle-booking/ReviewsSection"
import LocationSection from "@/components/map/LocationSection"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"
import VerifiedInfo from "@/components/profile/VerifiedInfo"
import ShareActions from "@/components/profile/ShareActions"
import VehiclesList from "@/components/profile/VehiclesList"
import { usePublicProfile } from "@/hooks/Profile/usePublicProfile"
import { useOwnerVehicles } from "@/hooks/Profile/useOwnerVehicles"
import { useAggregatedReviews } from "@/hooks/Profile/useAggregatedReviews"
import { useMapVehicle } from "@/hooks/Profile/useMapVehicle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BusinessHours from "@/components/profile/BusinessHours"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useJWT } from "@/contexts/JWTContext"

export default function Page() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useJWT()

  const activeTab = searchParams.get("tab") || "overview"

  const encodedUserId = params?.id as string
  const userId = useMemo(() => decodeId(encodedUserId) || "", [encodedUserId])

  const { profile, isLoadingProfile } = usePublicProfile(userId)
  const { vehicles, isLoadingVehicles, showAllVehicles, hasMoreVehicles, handleViewAllVehicles } = useOwnerVehicles(
    userId,
    4,
  )
  const { reviews, reviewsAll, reviewsError } = useAggregatedReviews(userId)
  const { mapVehicle } = useMapVehicle(userId)

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  if (isLoadingProfile || isLoadingVehicles) {
    return <ProfileSkeleton />
  }

  

  return (
    <div>
      <div className='mx-auto max-w-7xl py-8 px-4'>
        <div className="mb-8">
          <ProfileHeader profile={profile} userId={userId} />
          <ShareActions/>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Reviews Section */}
              <div>
                <ReviewsSection reviews={reviews} reviewsAll={reviewsAll} reviewsError={reviewsError} />
              </div>

              {/* Business Hours & Chat Section */}
              <div className="space-y-6">
                <BusinessHours isOwner={String(user?.id ?? '') === String(userId ?? '') && (user?.user_type?.toLowerCase?.() === 'owner')} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cars">
            <div className="max-w-7xl">
              <VehiclesList
                vehicles={vehicles}
                isLoadingVehicles={isLoadingVehicles}
              />
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div>
              <LocationSection vehicle={mapVehicle} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
