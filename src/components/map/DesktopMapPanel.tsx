"use client"

import dynamic from "next/dynamic"
import { VehicleResponse } from "@/services/vehicleServices"

const VehicleMap = dynamic(() => import("@/components/map/VehicleMap"), { ssr: false })

type Props = {
  isLoading: boolean
  error: unknown
  vehicles: VehicleResponse[]
  onRetry: () => void
  className?: string
  center?: [number, number] | null
  zoom?: number | null
}

export default function DesktopMapPanel({ isLoading, error, vehicles, onRetry, className, center, zoom }: Props) {
  return (
    <div className={className ?? "hidden lg:block lg:w-[45%] xl:w-[50%] 2xl:w-[55%] overflow-hidden"}>
      <div className="bg-white border-l border-gray-200 h-full">
        {isLoading ? (
          <VehicleMap vehicles={vehicles} className="h-full w-full" showControls={false} center={center} zoom={zoom} markerVariant="pin" />
        ) : error ? (
          <VehicleMap vehicles={vehicles} className="h-full w-full" showControls={false} center={center} zoom={zoom} markerVariant="pin" />
        ) : (
          <VehicleMap vehicles={vehicles} className="h-full w-full" showControls={false} center={center} zoom={zoom} markerVariant="pin" />
        )}
      </div>
    </div>
  )
}


