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
  // Default to Manila coordinates if no center is provided
  const defaultCenter: [number, number] = [14.5995, 120.9842] // Manila coordinates
  const defaultZoom = 11

  // Determine the center and zoom to use
  const mapCenter = center || defaultCenter
  const mapZoom = zoom || defaultZoom

  // Only show loading state on initial load (when vehicles array is empty)
  // During refetches, keep the map visible with existing vehicles
  const showLoading = isLoading && vehicles.length === 0

  return (
    <div className={className ?? "hidden lg:block lg:w-[45%] xl:w-[50%] 2xl:w-[55%] overflow-hidden"}>
      <div className="bg-white border-l border-gray-200 h-full">
        {showLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-gray-600 mb-4">Failed to load map</p>
              <button 
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <VehicleMap 
            vehicles={vehicles} 
            className="h-full w-full" 
            showControls={false} 
            center={mapCenter} 
            zoom={mapZoom} 
            markerVariant="pin" 
          />
        )}
      </div>
    </div>
  )
}


