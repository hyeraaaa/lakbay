"use client"

import { useMemo, memo } from "react"
import VehicleMap from "@/components/map/VehicleMap"
import type { VehicleResponse } from "@/services/vehicleServices"
import { useVehicleLiveLocation } from "@/hooks/cars/useVehicleLiveLocation"

type LiveLocationSectionProps = {
  vehicle: VehicleResponse | null
}

type LiveLocation = {
  latitude: number
  longitude: number
}

function LiveLocationSection({ vehicle }: LiveLocationSectionProps) {
  const vehicleId = vehicle?.vehicle_id
  const { hasTrackingDevice, liveLocation, initialLoading, isLive } = useVehicleLiveLocation(vehicleId)

  // Memoize vehicles array to prevent unnecessary map re-renders
  // Only update when vehicle or liveLocation coordinates actually change
  const vehiclesForMap = useMemo(() => {
    if (!vehicle) return [] as VehicleResponse[]
    if (liveLocation) {
      // Reuse VehicleMap by overriding garage coordinates with live coords
      const v: VehicleResponse = { 
        ...vehicle, 
        garage_latitude: liveLocation.latitude, 
        garage_longitude: liveLocation.longitude 
      }
      return [v]
    }
    return vehicle ? [vehicle] : []
  }, [vehicle, liveLocation?.latitude, liveLocation?.longitude])

  const getStatusText = () => {
    if (initialLoading) return "Loading location..."
    if (isLive) return "Live location"
    if (liveLocation && !isLive) return "Last known location"
    if (hasTrackingDevice) return "Waiting for device..."
    return "Garage location"
  }

  const getStatusStyling = () => {
    if (initialLoading) return "bg-blue-100 text-blue-700"
    if (isLive) return "bg-green-100 text-green-700"
    if (liveLocation && !isLive) return "bg-yellow-100 text-yellow-700"
    if (hasTrackingDevice) return "bg-gray-100 text-gray-600"
    return "bg-gray-100 text-gray-600"
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Location</h3>
        {hasTrackingDevice !== null && (
          <span className={`text-xs px-2 py-1 rounded ${getStatusStyling()}`}>
            {getStatusText()}
          </span>
        )}
      </div>
      {vehicle && (
        <div className="h-[22rem] md:h-[28rem] lg:h-[40rem] overflow-hidden">
          <VehicleMap
            vehicles={vehiclesForMap}
            className="h-full"
            showControls={true}
            markerVariant="pin"
            interactiveMarkers={false}
            showMarkerPopups={false}
            singleMarkerZoom={14}
            autoFitOnUpdate={true}
          />
        </div>
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders when parent updates
export default memo(LiveLocationSection)


