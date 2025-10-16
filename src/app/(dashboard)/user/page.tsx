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
import { decodeId } from "@/lib/idCodec"

const Page = () => {
  const [showMap, setShowMap] = useState(false)
  const searchParams = useSearchParams()

  // Map URL params to API params
  const apiParams = useMemo(() => {
    const city = searchParams.get('city') || undefined
    const province = searchParams.get('province') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    // Never pass owner_id to the API so the map retains all markers. Owner filtering is applied client-side only.
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
  // Optional server-side filtering by owner for the left panel only
  const ownerIdEncoded = searchParams.get('oid')
  const ownerIdParam = (() => {
    const decoded = decodeId(ownerIdEncoded || undefined)
    return decoded
  })()
  const filterOwner = searchParams.get('filterOwner') === '1'
  const ownerApiParams = useMemo(() => {
    if (!filterOwner) return undefined
    const owner_id = ownerIdParam || undefined
    if (!owner_id) return undefined
    return { ...apiParams, owner_id }
  }, [apiParams, ownerIdParam, filterOwner])
  const shouldFetchOwnerVehicles = !!ownerApiParams && shouldFetchVehicles
  const { vehicles: ownerVehicles, isLoading: isLoadingOwner } = useVehicles(ownerApiParams, shouldFetchOwnerVehicles, apiParams.nonce)
  // Optional deep-link params from map: by default, use them to center the map,
  // not to filter the dataset. Filtering applies only with explicit flags.
  const garageLat = searchParams.get('garageLat')
  const garageLng = searchParams.get('garageLng')
  const filterGarage = searchParams.get('filterGarage') === '1'

  const filteredVehicles = useMemo(() => {
    const base = filterOwner ? ownerVehicles : vehicles
    const byOwner = base

    if (!filterGarage || !garageLat || !garageLng) return byOwner
    const lat = parseFloat(garageLat)
    const lng = parseFloat(garageLng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return byOwner
    const tol = 1e-5
    return byOwner.filter(v => {
      const vlat = v.garage_latitude != null ? Number(v.garage_latitude) : NaN
      const vlng = v.garage_longitude != null ? Number(v.garage_longitude) : NaN
      return Number.isFinite(vlat) && Number.isFinite(vlng) && Math.abs(vlat - lat) < tol && Math.abs(vlng - lng) < tol
    })
  }, [vehicles, garageLat, garageLng, ownerIdParam, filterOwner, filterGarage])

  // Map view center/zoom: override geocoded center with exact garage coords if provided
  const mapCenter = useMemo(() => {
    if (garageLat && garageLng) {
      const lat = parseFloat(garageLat)
      const lng = parseFloat(garageLng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng] as [number, number]
    }
    return center
  }, [garageLat, garageLng, center])

  const mapZoom = useMemo(() => {
    if (garageLat && garageLng) return 15 as number
    return zoom
  }, [garageLat, garageLng, zoom])
  const isLoadingCombined = (isLoading || isLoadingOwner) || !shouldFetchVehicles || isGeocoding
  const contentHeight = useAvailableContentHeight()

  return (
    <div className="flex flex-col overflow-hidden">
      <FilterBar />
      <div className="flex gap-0 overflow-hidden relative" style={{ height: contentHeight !== null ? `${contentHeight}px` : undefined }}>
        <div className={`${showMap ? "hidden" : "block"} w-full lg:w-[55%] xl:w-[50%] 2xl:w-[45%] overflow-y-auto car-list-scroll p-4 space-y-4`}>
          {isLoadingCombined ? <VehicleListSkeleton /> : error ? null : <VehicleList vehicles={filteredVehicles} />}
        </div>

        <DesktopMapPanel isLoading={isLoadingCombined} error={error} vehicles={vehicles} onRetry={refetch} center={mapCenter} zoom={mapZoom} />

        <MobileMapView showMap={showMap} isLoading={isLoadingCombined} error={error} vehicles={vehicles} onRetry={refetch} center={mapCenter} zoom={mapZoom} />

        <MapToggleButton showMap={showMap} onToggle={() => setShowMap(!showMap)} />
      </div>
    </div>
  )
}

export default Page
