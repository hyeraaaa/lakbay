"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Settings, Calendar as CalendarIcon, Clock, AlertCircle, Loader2 } from "lucide-react"
import { format, startOfDay } from "date-fns"
import { useBooking, BookingFormData } from "@/hooks/booking/useBooking"
import { useVehicleBookings } from "@/hooks/booking/useVehicleBookings"
import { formatDateTime } from "@/lib/utils"
import { useJWT } from "@/contexts/JWTContext"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

type BookingSidebarProps = {
  pricePerDay: number | null | undefined
  vehicleId: number
}

export default function BookingSidebar({ pricePerDay, vehicleId }: BookingSidebarProps) {
  const [tripStart, setTripStart] = useState<Date | undefined>(new Date())
  const [tripEnd, setTripEnd] = useState<Date | undefined>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) // 3 days later
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false)
  const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false)
  const [tripStartTime, setTripStartTime] = useState<string>("10:00 AM")
  const [tripEndTime, setTripEndTime] = useState<string>("10:00 AM")
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<string>("")
  const [dropoffLocation, setDropoffLocation] = useState<string>("")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  
  const { isLoading, error, createBookingAndPay, clearError } = useBooking()
  const { isDateBooked, isLoading: isLoadingBookings, error: bookingsError, refreshBookings } = useVehicleBookings(vehicleId)
  const { user } = useJWT()

  const shouldHidePaymentButton = user?.user_type === 'owner' || user?.user_type === 'admin'

  const disablePastDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const disableBookedDates = (date: Date) => {
    // Disable past dates
    if (disablePastDates(date)) return true
    
    // Disable booked dates
    return isDateBooked(date)
  }

  const handleSelectTripStart = (date?: Date) => {
    setTripStart(date)
    if (date && tripEnd && startOfDay(tripEnd) < startOfDay(date)) {
      setTripEnd(date)
    }
    // If same day and end time earlier than start time, snap end time to start time
    if (date && tripEnd && startOfDay(tripEnd).getTime() === startOfDay(date).getTime()) {
      if (timeToMinutes(tripEndTime) < timeToMinutes(tripStartTime)) {
        setTripEndTime(tripStartTime)
      }
    }
  }

  const handleSelectTripEnd = (date?: Date) => {
    if (date && tripStart && startOfDay(date) < startOfDay(tripStart)) {
      // Prevent selecting an end date earlier than start; snap to start
      setTripEnd(tripStart)
      return
    }
    setTripEnd(date)
    // If same day and end time earlier than start time, snap end time to start time
    if (date && tripStart && startOfDay(date).getTime() === startOfDay(tripStart).getTime()) {
      if (timeToMinutes(tripEndTime) < timeToMinutes(tripStartTime)) {
        setTripEndTime(tripStartTime)
      }
    }
  }

  // Time utilities and options
  const timeOptions = [
    "12:00 AM","12:30 AM","01:00 AM","01:30 AM","02:00 AM","02:30 AM",
    "03:00 AM","03:30 AM","04:00 AM","04:30 AM","05:00 AM","05:30 AM",
    "06:00 AM","06:30 AM","07:00 AM","07:30 AM","08:00 AM","08:30 AM",
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
    "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM",
    "06:00 PM","06:30 PM","07:00 PM","07:30 PM","08:00 PM","08:30 PM",
    "09:00 PM","09:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM"
  ]

  function timeToMinutes(label: string): number {
    // e.g., "10:30 AM" -> minutes since midnight
    const match = label.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i)
    if (!match) return 0
    let hour = parseInt(match[1], 10)
    const minute = parseInt(match[2], 10)
    const meridiem = match[3].toUpperCase()
    if (meridiem === "PM" && hour !== 12) hour += 12
    if (meridiem === "AM" && hour === 12) hour = 0
    return hour * 60 + minute
  }

  const handleStartTimeChange = (value: string) => {
    setTripStartTime(value)
    // 24-hour logic: keep end time equal to start time by default
    setTripEndTime(value)
  }

  const handleEndTimeChange = (value: string) => {
    // Prevent choosing end time earlier than start time on the same day
    if (tripStart && tripEnd && startOfDay(tripStart).getTime() === startOfDay(tripEnd).getTime()) {
      if (timeToMinutes(value) < timeToMinutes(tripStartTime)) {
        setTripEndTime(tripStartTime)
        return
      }
    }
    setTripEndTime(value)
  }


  const handleBookingSubmit = async () => {
    if (!tripStart || !tripEnd || !pickupLocation.trim() || !dropoffLocation.trim()) {
      return
    }

    clearError()

    const formData: BookingFormData = {
      vehicle_id: vehicleId,
      start_date: formatDateTime(tripStart, tripStartTime),
      end_date: formatDateTime(tripEnd, tripEndTime),
      pick_up_location: pickupLocation.trim(),
      drop_off_location: dropoffLocation.trim(),
    }

    const success = await createBookingAndPay(formData)
    
    if (!success) {
      // Error is already set by the hook
      return
    }
    
    // Refresh bookings to update availability
    await refreshBookings()
  }

  const isFormValid = tripStart && tripEnd && pickupLocation.trim() && dropoffLocation.trim()

  return (
    <>
    <Card className="sticky top-6 border border-border">
      <CardContent className="px-6">
        {/* Price */}
        <div className="mb-6">
          <div className="">
            <div className="text-2xl font-bold text-foreground">
              ₱{pricePerDay ? pricePerDay.toLocaleString() : 0} <span className="text-base font-normal text-muted-foreground">per day</span>
            </div>
            <div className="text-sm text-muted-foreground">Before taxes</div>
          </div>
        </div>


        {/* Your Trip */}
        <div className="mb-6 space-y-4 pt-4 border-t border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Your trip</h3>
    
          {/* Trip Start */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Trip start</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tripStart ? format(tripStart, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tripStart}
                    onSelect={handleSelectTripStart}
                    disabled={disableBookedDates}
                    fromDate={new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <Clock className="mr-2 h-4 w-4" />
                    {tripStartTime}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="start">
                  <div className="max-h-60 overflow-auto py-1">
                    {timeOptions.map((t) => (
                      <button
                        key={t}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${t === tripStartTime ? "bg-accent text-accent-foreground" : ""}`}
                        onClick={() => {
                          handleStartTimeChange(t)
                          setIsStartTimeOpen(false)
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Trip End */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Trip end</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={isEndPopoverOpen} onOpenChange={setIsEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tripEnd ? format(tripEnd, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tripEnd}
                    onSelect={handleSelectTripEnd}
                    disabled={(date) => {
                      if (disableBookedDates(date)) return true
                      if (tripStart) return startOfDay(date) < startOfDay(tripStart)
                      return false
                    }}
                    fromDate={tripStart ?? new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" className="justify-start text-left font-normal" disabled>
                <Clock className="mr-2 h-4 w-4" />
                {tripEndTime}
              </Button>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Pickup location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Drop-off Location */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Drop-off location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter drop-off location"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error Alerts */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {bookingsError && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Unable to load booking availability: {bookingsError}</AlertDescription>
            </Alert>
          )}

          {/* Continue Button */}
          {!shouldHidePaymentButton && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!isFormValid || isLoading || isLoadingBookings}
            >
              {isLoading || isLoadingBookings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLoading ? "Processing..." : "Loading availability..."}
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          )}
        </div>

        {/* Availability Info */}
        {!isLoadingBookings && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-sm text-blue-800">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Booked dates are disabled and cannot be selected</span>
            </div>
          </div>
        )}

        {/* Policies */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <h4 className="font-medium text-foreground mb-2">Cancellation policy</h4>
            <p className="text-sm text-muted-foreground">Free cancellation before 24 hours of departure. View flexible options available at checkout.</p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Payment options</h4>
            <p className="text-sm text-muted-foreground">Pay now when you reserve or pay later when you pick up the car. Flexible payment options at checkout.</p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Distance included</h4>
            <p className="text-sm text-muted-foreground">Unlimited</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <ConfirmationDialog
      open={isConfirmOpen}
      onOpenChange={setIsConfirmOpen}
      title="Confirm booking details"
      description={`Proceed to payment for ${tripStart ? format(tripStart, "MMM dd, yyyy") : ""} ${tripStartTime} to ${tripEnd ? format(tripEnd, "MMM dd, yyyy") : ""} ${tripEndTime}?\nPickup: ${pickupLocation || "(not set)"}\nDrop-off: ${dropoffLocation || "(not set)"}`}
      confirmText="Continue to Payment"
      onConfirm={handleBookingSubmit}
    />
    </>
  )
}


