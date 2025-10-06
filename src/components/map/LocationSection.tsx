"use client"

import VehicleMap from "@/components/map/VehicleMap"
import type { VehicleResponse } from "@/services/vehicleServices"

type LocationSectionProps = {
  vehicle: VehicleResponse | null
}

export default function LocationSection({ vehicle }: LocationSectionProps) {
  return (
    <div className="mt-10">
      <h3 className="font-semibold text-lg mb-4">Location</h3>
      {/* Loading state removed; parent page shows a skeleton */}
      {vehicle && (
        <div className="h-[22rem] md:h-[28rem] lg:h-[34rem] rounded-md overflow-hidden border">
          <VehicleMap vehicles={[vehicle]} className="h-full" showControls={true} markerVariant="pin" interactiveMarkers={false} showMarkerPopups={false} singleMarkerZoom={17} />
        </div>
      )}
    </div>
  )
}


