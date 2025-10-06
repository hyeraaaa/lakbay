"use client"
import { useMemo, useState } from "react"
import FilterBar from "@/components/filters/FilterBar"
import { useVehicles } from "@/hooks/useVehicles"
import VehicleListSkeleton from "@/components/browse-vehicle/VehicleListSkeleton"
import VehicleList from "@/components/browse-vehicle/VehicleList"
import DesktopMapPanel from "@/components/map/DesktopMapPanel"
import MobileMapView from "@/components/map/MobileMapView"
import MapToggleButton from "@/components/map/MapToggleButton"
import { useAvailableContentHeight } from "@/hooks/useAvailableContentHeight"
import { useSearchParams } from "next/navigation"
import { useGeocodeLocation } from "@/hooks/useGeocodeLocation"

const Page = () => {
  const [showMap, setShowMap] = useState(false)
  const searchParams = useSearchParams()

  // Map URL params to API params
  const apiParams = useMemo(() => {
    const city = searchParams.get('city') || undefined
    const province = searchParams.get('province') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    // vehicle filters
    const type = searchParams.get('type') || undefined
    const brand = searchParams.get('brand') || undefined
    const model = searchParams.get('model') || undefined
    const seats = searchParams.get('seats') || undefined
    const year = searchParams.get('year') || undefined
    const minRate = searchParams.get('minRate') || undefined
    const maxRate = searchParams.get('maxRate') || undefined
    const nonce = searchParams.get('_') || undefined
    return { city, province, startDate, endDate, type, brand, model, seats, year, minRate, maxRate, nonce }
  }, [searchParams])

  const { isGeocoding, isReady, center, zoom } = useGeocodeLocation(apiParams.city ?? null, apiParams.province ?? null)
  const hasLocationSearch = !!(apiParams.city || apiParams.province)
  // Only fetch after geocoding declares ready (even if no results), so the map updates first
  const shouldFetchVehicles = !hasLocationSearch || (isReady && !isGeocoding)
  const { vehicles, isLoading, error, refetch } = useVehicles(apiParams, shouldFetchVehicles, apiParams.nonce)
  const isLoadingCombined = isLoading || !shouldFetchVehicles || isGeocoding
  const contentHeight = useAvailableContentHeight()

  return (
    <div className="flex flex-col overflow-hidden">
      <FilterBar />
      <div className="flex gap-0 overflow-hidden relative" style={{ height: contentHeight !== null ? `${contentHeight}px` : undefined }}>
        <div className={`${showMap ? "hidden" : "block"} w-full lg:w-[55%] xl:w-[50%] 2xl:w-[45%] overflow-y-auto car-list-scroll p-4 space-y-4`}>
          {isLoadingCombined ? <VehicleListSkeleton /> : error ? null : <VehicleList vehicles={vehicles} />}
        </div>

        <DesktopMapPanel isLoading={isLoadingCombined} error={error} vehicles={vehicles} onRetry={refetch} center={center} zoom={zoom} />

        <MobileMapView showMap={showMap} isLoading={isLoadingCombined} error={error} vehicles={vehicles} onRetry={refetch} />

        <MapToggleButton showMap={showMap} onToggle={() => setShowMap(!showMap)} />
      </div>
    </div>
  )
}

export default Page
