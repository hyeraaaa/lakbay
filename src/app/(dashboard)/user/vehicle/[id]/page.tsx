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
import { MapPin, Flag } from "lucide-react"
import ReviewsSection from "@/components/vehicle-booking/ReviewsSection"
import LocationSection from "@/components/map/LocationSection"
import { useVehicleDetails } from "@/hooks/booking/useVehicleDetails"
import VehicleDetailsSkeleton from "@/components/vehicle-booking/VehicleDetailsSkeleton"
import VehicleReportDialog from "@/components/vehicle-booking/VehicleReportDialog"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { transformVehicleData } from "@/lib/transformVehicleData"
import { useJWT } from "@/contexts/JWTContext"


export default function CarBookingInterface() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const { vehicle, isLoading, reviews, reviewsError, tripCount } = useVehicleDetails()
  const { isAuthenticated } = useJWT()

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
              <div className="flex items-start justify-between gap-4">
              <TitleAndBadges
                title={vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "Vehicle"}
                seats={vehicle?.seats}
                fuelType={vehicle?.fuel_type}
                transmission={vehicle?.transmission}
                carType={vehicle?.type}
                coding={vehicle?.coding}
                rating={reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null}
                tripCount={tripCount}
              />
              {vehicle && isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReportDialogOpen(true)}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              )}
            </div>
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

        <div id="location" className="scroll-mt-24 mt-10">
        <h3 className="font-semibold text-lg mb-5">Location</h3>
        <LocationSection vehicle={vehicle} />
      </div>
      </div>
      )}
      {vehicle && (
        <VehicleReportDialog
          vehicleId={vehicle.vehicle_id.toString()}
          vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
        />
      )}
    </div>
  )
}
