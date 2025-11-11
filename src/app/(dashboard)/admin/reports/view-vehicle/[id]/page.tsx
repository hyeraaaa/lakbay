"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getVehiclePrimaryImageUrl, getImageUrl } from "@/lib/imageUtils"
import { decodeId, encodeId } from "@/lib/idCodec"
import ImageGallery from "@/components/vehicle-booking/ImageGallery"
import GalleryDialog from "@/components/vehicle-booking/GalleryDialog"
import TitleAndBadges from "@/components/vehicle-booking/TitleAndBadges"
import VehicleFeatures from "@/components/vehicle-booking/VehicleFeatures"
import BookingSidebar from "@/components/vehicle-booking/BookingSidebar"
import HostSection from "@/components/vehicle-booking/HostSection"
import { List, X, Trash2, Ban } from "lucide-react"
import ReviewsSection from "@/components/vehicle-booking/ReviewsSection"
import LocationSection from "@/components/map/LocationSection"
import { useVehicleDetails } from "@/hooks/booking/useVehicleDetails"
import VehicleDetailsSkeleton from "@/components/vehicle-booking/VehicleDetailsSkeleton"
import { vehicleService } from "@/services/vehicleServices"
import { bookingService, type Booking } from "@/services/bookingServices"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

export default function CarBookingInterface() {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isBookingsDialogOpen, setIsBookingsDialogOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelAllDialogOpen, setCancelAllDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isCancelingAll, setIsCancelingAll] = useState(false)
  const hasFetchedBookings = useRef(false)
  const { vehicle, isLoading, reviews, reviewsAll, reviewsError, tripCount } = useVehicleDetails()

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

  // Fetch bookings for this vehicle
  const fetchBookings = useCallback(async () => {
    const rawId = (params as { id?: string | string[] })?.id
    const idStr = Array.isArray(rawId) ? rawId[0] : rawId
    if (!idStr) return

    // Decode the vehicle ID (it's encoded in the URL)
    const decodedId = decodeId(idStr)
    if (!decodedId) {
      setBookingsError('Invalid vehicle ID')
      return
    }

    const vehicleId = Number(decodedId)
    if (!vehicleId || Number.isNaN(vehicleId)) {
      setBookingsError('Invalid vehicle ID')
      return
    }

    setIsLoadingBookings(true)
    setBookingsError(null)
    try {
      const response = await bookingService.listBookings({ 
        vehicle_id: vehicleId, 
        limit: 100 
      })
      setBookings(response.bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookingsError(error instanceof Error ? error.message : 'Failed to fetch bookings')
      setBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }, [params])

  // Reset fetch flag when dialog closes
  useEffect(() => {
    if (!isBookingsDialogOpen) {
      hasFetchedBookings.current = false
    }
  }, [isBookingsDialogOpen])

  // Fetch bookings when dialog opens for the first time
  useEffect(() => {
    if (isBookingsDialogOpen && !hasFetchedBookings.current && !isLoadingBookings) {
      hasFetchedBookings.current = true
      fetchBookings()
    }
  }, [isBookingsDialogOpen, isLoadingBookings, fetchBookings])

  // Handle booking cancellation (admin bypass)
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    setIsCanceling(true)
    try {
      // Admin bypass - cancel directly via DELETE endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingToCancel}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ reason: 'Admin cancellation' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to cancel booking')
      }

      // Refresh bookings list
      await fetchBookings()
      setCancelDialogOpen(false)
      setBookingToCancel(null)
    } catch (error) {
      console.error('Error canceling booking:', error)
      setBookingsError(error instanceof Error ? error.message : 'Failed to cancel booking')
    } finally {
      setIsCanceling(false)
    }
  }

  // Handle cancel all bookings
  const handleCancelAllBookings = async () => {
    setIsCancelingAll(true)
    try {
      const cancelableBookings = bookings.filter(b => b.status !== 'canceled')
      
      // Cancel all bookings in parallel
      await Promise.all(
        cancelableBookings.map(async (booking) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${booking.booking_id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ reason: 'Admin batch cancellation' })
          })

          if (!response.ok) {
            throw new Error(`Failed to cancel booking ${booking.booking_id}`)
          }
        })
      )

      // Refresh bookings list
      await fetchBookings()
      setCancelAllDialogOpen(false)
    } catch (error) {
      console.error('Error canceling all bookings:', error)
      setBookingsError(error instanceof Error ? error.message : 'Failed to cancel all bookings')
    } finally {
      setIsCancelingAll(false)
    }
  }

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
    <div className="min-h-screen">
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
            <div>
              <TitleAndBadges
                title={vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "Vehicle"}
                seats={vehicle?.seats}
                fuelType={vehicle?.fuel_type}
                transmission={vehicle?.transmission}
                carType={vehicle?.type}
                coding={vehicle?.coding}
                rating={reviewsAll && reviewsAll.length > 0 ? reviewsAll.reduce((sum, r) => sum + r.rating, 0) / reviewsAll.length : null}
                tripCount={tripCount}
              />
            </div>

            <HostSection 
              hostFirstName={vehicle?.users?.first_name} 
              hostLastName={vehicle?.users?.last_name} 
              hostProfilePicture={vehicle?.users?.profile_picture}
              hostUserId={vehicle?.owner_id}
            />

            <VehicleFeatures description={vehicle?.description} features={vehicle?.features} />

            {/* Location Section moved below grid for larger layout */}

            <ReviewsSection reviews={reviews} reviewsError={reviewsError} reviewsAll={reviewsAll} />

          </div>

          {/* Sidebar (right column) */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <BookingSidebar
                pricePerDay={vehicle?.rate_per_day}
                vehicleId={vehicle?.vehicle_id || 0}
              />
            </div>

            {/* View Bookings Button */}
            <div>
              <Dialog open={isBookingsDialogOpen} onOpenChange={setIsBookingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="default" className="w-full">
                    <List className="w-4 h-4 mr-2" />
                    View Bookings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[85vh] p-6">
                  <DialogHeader className="pb-4 border-b mb-4 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">Vehicle Bookings</DialogTitle>
                    {bookings.length > 0 && bookings.some(b => b.status !== 'canceled' && b.status !== 'completed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelAllDialogOpen(true)}
                        disabled={isCancelingAll}
                        className="gap-2"
                      >
                        {isCancelingAll ? (
                          <>
                            <X className="h-4 w-4 animate-spin" />
                            Canceling
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4" />
                            Cancel All
                          </>
                        )}
                      </Button>
                    )}
                  </DialogHeader>
                  
                  <div className="overflow-y-auto max-h-[60vh]">
                    {isLoadingBookings ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : bookingsError ? (
                      <div className="text-center py-12">
                        <div className="text-red-600 font-medium">{bookingsError}</div>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-sm">No bookings found for this vehicle.</div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="font-semibold">Renter Name</TableHead>
                            <TableHead className="font-semibold">Start Date</TableHead>
                            <TableHead className="font-semibold">End Date</TableHead>
                            <TableHead className="font-semibold">Amount</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow 
                              key={booking.booking_id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                router.push(`/admin/verification-requests/booking-details/${encodeId(booking.booking_id.toString())}`)
                              }}
                            >
                              <TableCell className="font-medium">
                                {booking.users?.first_name} {booking.users?.last_name}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(booking.start_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(booking.end_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell className="font-semibold text-black">
                                ₱{booking.payment_details?.[0]?.amount?.toLocaleString() || '0'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  booking.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                  booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  booking.status === 'canceled' ? 'bg-red-50 text-red-700 border-red-200' :
                                  booking.status === 'on_going' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }>
                                  {booking.status === 'pending_payment' ? 'Pending Payment' :
                                   booking.status === 'awaiting_owner_approval' ? 'Awaiting Approval' :
                                   booking.status === 'confirmed' ? 'Confirmed' :
                                   booking.status === 'on_going' ? 'On Going' :
                                   booking.status === 'canceled' ? 'Canceled' :
                                   booking.status === 'completed' ? 'Completed' :
                                   booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                {(() => {
                                  const status = booking.status?.toLowerCase();
                                  const isCompleted = status === 'completed';
                                  const isCanceled = status === 'canceled';
                                  
                                  if (isCompleted) {
                                    return <span className="text-xs text-gray-400 italic">Completed</span>;
                                  } else if (isCanceled) {
                                    return <span className="text-xs text-gray-400 italic">Canceled</span>;
                                  } else {
                                    return (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setBookingToCancel(booking.booking_id)
                                          setCancelDialogOpen(true)
                                        }}
                                        disabled={isCanceling}
                                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Cancel booking"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    );
                                  }
                                })()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Cancel Booking Confirmation Dialog */}
          <ConfirmationDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            title="Cancel Booking (Admin Bypass)"
            description="Are you sure you want to cancel this booking? As an admin, this will bypass normal cancellation restrictions. This action cannot be undone."
            confirmText="Cancel Booking"
            cancelText="Keep Booking"
            variant="destructive"
            onConfirm={handleCancelBooking}
          />

          {/* Cancel All Bookings Confirmation Dialog */}
          <ConfirmationDialog
            open={cancelAllDialogOpen}
            onOpenChange={setCancelAllDialogOpen}
            title="Cancel All Bookings (Admin Bypass)"
            description={`Are you sure you want to cancel all ${bookings.filter(b => b.status !== 'canceled').length} active bookings for this vehicle? As an admin, this will bypass normal cancellation restrictions. This action cannot be undone.`}
            confirmText="Cancel All"
            cancelText="Keep Bookings"
            variant="destructive"
            onConfirm={handleCancelAllBookings}
          />
        </div>
        <LocationSection vehicle={vehicle} />
      </div>
      )}
    </div>
  )
}


