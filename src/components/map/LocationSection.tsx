"use client"

import VehicleMap from "@/components/map/VehicleMap"
import type { VehicleResponse } from "@/services/vehicleServices"

type LocationSectionProps = {
  vehicle: VehicleResponse | null
  profileLocation?: { latitude: number; longitude: number; name?: string } | null
}

export default function LocationSection({ vehicle, profileLocation }: LocationSectionProps) {
  // Create a mock vehicle object from profile location if no vehicle exists
  const mapData = vehicle || (profileLocation ? {
    vehicle_id: 0,
    owner_id: 0,
    description: 'Garage Location',
    plate_number: '',
    availability: 'available',
    model: 'Location',
    brand: 'Garage',
    type: 'sedan',
    year: new Date().getFullYear(),
    seats: 0,
    rate_per_day: 0,
    is_registered: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    color: '',
    features: [],
    fuel_type: '',
    transmission: '',
    garage_latitude: profileLocation.latitude,
    garage_longitude: profileLocation.longitude,
    garage_location_name: profileLocation.name || 'Garage Location'
  } : null)

  return (
    <div>
      {mapData && (
        <div className="h-[22rem] md:h-[28rem] lg:h-[40rem] overflow-hidden">
          <VehicleMap 
            vehicles={[mapData]} 
            className="h-full" 
            showControls={true} 
            showZoomControl={false} 
            markerVariant="pin" 
            interactiveMarkers={false} 
            showMarkerPopups={false} 
            singleMarkerZoom={14} 
          />
        </div>
      )}
    </div>
  )
}


