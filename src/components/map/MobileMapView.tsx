"use client"

import dynamic from "next/dynamic"
import { VehicleResponse } from "@/services/vehicleServices"
import { useEffect } from "react"

const VehicleMap = dynamic(() => import("@/components/map/VehicleMap"), { ssr: false })

type Props = {
  showMap: boolean
  isLoading: boolean
  error: unknown
  vehicles: VehicleResponse[]
  onRetry: () => void
  center?: [number, number] | null
  zoom?: number | null
}

export default function MobileMapView({ showMap, isLoading, error, vehicles, onRetry, center, zoom }: Props) {
  useEffect(() => {
    if (showMap) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showMap])

  return (
    <div className={`${showMap ? "block" : "hidden"} lg:hidden w-full h-full overflow-hidden`}>
      <div className="bg-white h-full w-full flex">
        <VehicleMap key={showMap ? "mobile-map" : "mobile-list"} vehicles={vehicles} className="h-full w-full flex-1" showControls={false} markerVariant="pin" center={center} zoom={zoom} />
      </div>
    </div>
  )
}


