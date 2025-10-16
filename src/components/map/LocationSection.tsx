"use client"

import VehicleMap from "@/components/map/VehicleMap"
import type { VehicleResponse } from "@/services/vehicleServices"

type LocationSectionProps = {
  vehicle: VehicleResponse | null
}

export default function LocationSection({ vehicle }: LocationSectionProps) {
  return (
    <div>
      {/* Loading state removed; parent page shows a skeleton */}
      {vehicle && (
        <div className="h-[22rem] md:h-[28rem] lg:h-[40rem] overflow-hidden">
          <VehicleMap vehicles={[vehicle]} className="h-full" showControls={true} showZoomControl={false} markerVariant="pin" interactiveMarkers={false} showMarkerPopups={false} singleMarkerZoom={14} />
        </div>
      )}
    </div>
  )
}


