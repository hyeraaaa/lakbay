"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { type VehicleResponse } from "@/services/vehicleServices"
import { getVehiclePrimaryImageUrl, getImageUrl } from "@/lib/imageUtils"
import ImageGallery from "@/components/vehicle-booking/ImageGallery"
import GalleryDialog from "@/components/vehicle-booking/GalleryDialog"
import TitleAndBadges from "@/components/vehicle-booking/TitleAndBadges"
import HostSection from "@/components/vehicle-booking/HostSection"
import VehicleFeatures from "@/components/vehicle-booking/VehicleFeatures"
import BookingSidebar from "@/components/vehicle-booking/BookingSidebar"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReviewsSection from "@/components/vehicle-booking/ReviewsSection"
import LiveLocationSection from "@/components/map/LiveLocationSection"
import { useVehicleDetails } from "@/hooks/booking/useVehicleDetails"
import VehicleDetailsSkeleton from "@/components/vehicle-booking/VehicleDetailsSkeleton"
import { vehicleService } from "@/services/vehicleServices"

export default function CarBookingInterface() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { vehicle, isLoading, reviews, reviewsError, tripCount } = useVehicleDetails()

  // Priority prefetch: kick off location-related data fetch ASAP using route id
  const params = useParams()
  useEffect(() => {
    const rawId = (params as { id?: string | string[] })?.id
    const idStr = Array.isArray(rawId) ? rawId[0] : rawId
    const vehicleId = idStr ? Number(idStr) : undefined
    if (!vehicleId || Number.isNaN(vehicleId)) return
    ;(async () => {
      try {
        await vehicleService.getVehicleGPSDevices(vehicleId)
      } catch {}
    })()
  }, [params])

  const carImages = useMemo(() => {
    const urls = (vehicle?.vehicle_images || [])
      .sort((a, b) =>
        a.is_primary === b.is_primary ? a.image_order - b.image_order : Number(b.is_primary) - Number(a.is_primary),
      )
      .map((img) => getImageUrl(img.url))
    if (urls.length === 0 && vehicle) {
      const fallback = getVehiclePrimaryImageUrl(vehicle)
      return fallback ? [fallback] : []
    }
    return urls
  }, [vehicle])

  return (
    <div className="min-h-screen bg-white">
      {isLoading ? (
        <VehicleDetailsSkeleton />
      ) : (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Full-width Image Gallery */}
          <div className="lg:col-span-3">
            <ImageGallery carImages={carImages} isGalleryOpen={isGalleryOpen} setIsGalleryOpen={setIsGalleryOpen} />
            <GalleryDialog carImages={carImages} isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
          </div>

          {/* Main Content (below gallery) */}
          <div className="lg:col-span-2 space-y-6">
            <TitleAndBadges
              title={vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "Vehicle"}
              seats={vehicle?.seats}
              fuelType={vehicle?.fuel_type}
              transmission={vehicle?.transmission}
              coding={vehicle?.coding}
              rating={reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null}
              tripCount={tripCount}
            />

            <HostSection 
              hostFirstName={vehicle?.users?.first_name} 
              hostLastName={vehicle?.users?.last_name} 
              hostProfilePicture={vehicle?.users?.profile_picture}
              hostUserId={vehicle?.owner_id}
            />

            <VehicleFeatures description={vehicle?.description} features={vehicle?.features} />


            {/* Location Section moved below grid for larger layout */}

              <ReviewsSection reviews={reviews} reviewsError={reviewsError} />
          </div>

          {/* Booking Sidebar */}
          <div>
            <BookingSidebar 
              pricePerDay={vehicle?.rate_per_day} 
              vehicleId={vehicle?.vehicle_id || 0}
            />
          </div>
        </div>

        <LiveLocationSection vehicle={vehicle} />
      </div>
      )}
    </div>
  )
}


