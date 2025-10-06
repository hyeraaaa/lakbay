"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import { VehicleResponse } from "@/services/vehicleServices"
import { useEffect } from "react"

const VehicleMap = dynamic(() => import("@/components/map/VehicleMap"), { ssr: false })

type Props = {
  showMap: boolean
  isLoading: boolean
  error: unknown
  vehicles: VehicleResponse[]
  onRetry: () => void
}

export default function MobileMapView({ showMap, isLoading, error, vehicles, onRetry }: Props) {
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
        {isLoading ? (
          <div className="h-full bg-gray-100 animate-pulse">
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-full relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Map...</h3>
                    <p className="text-gray-600">Fetching vehicle locations</p>
                  </div>
                </div>
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Map Error</h3>
              <p className="text-gray-600 mb-2">Unable to load map</p>
              <button onClick={onRetry} className="text-sm text-blue-600 hover:text-blue-800 underline">Try again</button>
            </div>
          </div>
        ) : (
          <VehicleMap key={showMap ? "mobile-map" : "mobile-list"} vehicles={vehicles} className="h-full w-full flex-1" showControls={false} />
        )}
      </div>
    </div>
  )
}


