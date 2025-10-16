"use client"

import { useMemo, useState } from "react"
import { type VehicleResponse } from "@/services/vehicleServices"
import { getVehiclePrimaryImageUrl, getImageUrl } from "@/lib/imageUtils"
import ImageGallery from "@/components/vehicle-booking/ImageGallery"
import GalleryDialog from "@/components/vehicle-booking/GalleryDialog"
import TitleAndBadges from "@/components/vehicle-booking/TitleAndBadges"
import HostSection from "@/components/vehicle-booking/HostSection"
import VehicleFeatures from "@/components/vehicle-booking/VehicleFeatures"
import BookingSidebar from "@/components/vehicle-booking/BookingSidebar"
import { MapPin } from "lucide-react"
import ReviewsSection from "@/components/vehicle-booking/ReviewsSection"
import LocationSection from "@/components/map/LocationSection"
import { useVehicleDetails } from "@/hooks/booking/useVehicleDetails"
import VehicleDetailsSkeleton from "@/components/vehicle-booking/VehicleDetailsSkeleton"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { transformVehicleData } from "@/lib/transformVehicleData"


export default function CarBookingInterface() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { vehicle, isLoading, reviews, reviewsError, tripCount } = useVehicleDetails()

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

  const locationLabel = useMemo(() => {
    if (!vehicle) return null
    return transformVehicleData(vehicle).location
  }, [vehicle])

  return (
    <div className="min-h-screen scroll-smooth">
      {isLoading ? (
        <VehicleDetailsSkeleton />
      ) : (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/user">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vehicles</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Full-width Image Gallery */}
          <div className="lg:col-span-3">
            <ImageGallery carImages={carImages} isGalleryOpen={isGalleryOpen} setIsGalleryOpen={setIsGalleryOpen} />
            <GalleryDialog carImages={carImages} isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
          </div>

          {/* Main Content (below gallery) */}
          <div id="overview" className="lg:col-span-2 space-y-6 scroll-mt-24">
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
            
            <div id="reviews" className="scroll-mt-24">
              <ReviewsSection reviews={reviews} reviewsError={reviewsError} />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div>
            <BookingSidebar 
              pricePerDay={vehicle?.rate_per_day} 
              vehicleId={vehicle?.vehicle_id || 0}
            />
          </div>
        </div>
      </div>
      )}


      <div id="location" className="scroll-mt-24">
        <LocationSection vehicle={vehicle} />
      </div>
    </div>
  )
}
