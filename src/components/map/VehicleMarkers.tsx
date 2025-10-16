"use client"

import { Marker, useMap } from "react-leaflet"
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { VehicleResponse } from "@/services/vehicleServices"
import L from 'leaflet'
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { encodeId } from "@/lib/idCodec"
import { MapPin, User } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function createVehicleIcon(vehicle: VehicleResponse, variant: 'price' | 'pin') {
  if (variant === 'pin') return undefined as unknown as L.Icon | undefined
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="rounded-md border border-gray-300 bg-white w-auto h-auto px-3 py-1.5 inline-flex items-center justify-center shadow">
        <div class="text-[16px] font-normal text-black leading-none">₱${vehicle.rate_per_day.toLocaleString()}</div>
      </div>
    `,
    iconSize: [72, 40],
    iconAnchor: [36, 40],
    popupAnchor: [0, -40]
  })
}

function getVehicleCoordinates(vehicle: VehicleResponse): [number, number] | null {
  const latNum = vehicle.garage_latitude != null ? Number(vehicle.garage_latitude) : NaN
  const lonNum = vehicle.garage_longitude != null ? Number(vehicle.garage_longitude) : NaN
  if (Number.isFinite(latNum) && Number.isFinite(lonNum)) return [latNum, lonNum]
  return null
}

function metersToLatLngDelta(lat: number, dxMeters: number, dyMeters: number): [number, number] {
  const oneDegreeLatMeters = 111_320
  const latRad = (lat * Math.PI) / 180
  const oneDegreeLngMeters = 111_320 * Math.cos(latRad)
  const dLat = dyMeters / oneDegreeLatMeters
  const dLng = oneDegreeLngMeters === 0 ? 0 : dxMeters / oneDegreeLngMeters
  return [dLat, dLng]
}

function getOffsetPosition(base: [number, number], index: number, total: number): [number, number] {
  if (total <= 1) return base
  const radiusMeters = 12
  const angle = (2 * Math.PI * index) / total
  const dx = Math.cos(angle) * radiusMeters
  const dy = Math.sin(angle) * radiusMeters
  const [dLat, dLng] = metersToLatLngDelta(base[0], dx, dy)
  return [base[0] + dLat, base[1] + dLng]
}

type VehicleMarkersProps = {
  vehicles: VehicleResponse[]
  markerVariant?: 'price' | 'pin'
  interactive?: boolean
  showPopups?: boolean
}

export default function VehicleMarkers({
  vehicles,
  markerVariant = 'price',
  interactive = true,
  showPopups = true
}: VehicleMarkersProps) {
  const map = useMap()
  const [selected, setSelected] = useState<null | { base: [number, number]; items: VehicleResponse[] }>(null)
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const ownerInfo = useMemo(() => {
    if (!selected) return { ownerName: null as string | null, oid: undefined as string | undefined, ownerId: undefined as number | undefined }
    const ownerIds = Array.from(new Set(selected.items.map(v => v.owner_id)))
    const ownerId = ownerIds.length === 1 ? ownerIds[0] : undefined
    let ownerName: string | null = null
    if (ownerId != null) {
      const sample = selected.items.find(v => v.owner_id === ownerId)
      const first = sample?.users?.first_name?.trim() || ''
      const last = sample?.users?.last_name?.trim() || ''
      const full = `${first} ${last}`.trim()
      ownerName = full || null
    }
    const oid = ownerId != null ? encodeId(String(ownerId)) : undefined
    return { ownerName, oid, ownerId }
  }, [selected])

  // ✅ FIXED useEffect (TypeScript-safe cleanup)
  useEffect(() => {
    if (!selected) {
      setAnchorPos(null)
      return
    }

    const pt = map.latLngToContainerPoint(selected.base)
    setAnchorPos({ x: pt.x, y: pt.y })

    const handler = () => {
      const p = map.latLngToContainerPoint(selected.base)
      setAnchorPos({ x: p.x, y: p.y })
    }

    map.on('move zoom', handler)

    return () => {
      map.off('move zoom', handler)
    }
  }, [map, selected])

  const handleViewCars = () => {
    if (!ownerInfo.oid) return
  
    // Smoothly fly the map to the selected marker's base position
    if (selected) {
      const target = selected.base
      try {
        // Signal the map to skip auto-fit during our animation window (match duration)
        ;(window as unknown as { __lakbaySkipNextAutoFit?: boolean; __lakbaySkipAutoFitUntil?: number }).__lakbaySkipAutoFitUntil = Date.now() + 900
        const currentZoom = map.getZoom?.() ?? 13
        const targetZoom = Math.max(currentZoom, 15)
        map.flyTo(target as unknown as L.LatLngExpression, targetZoom, { animate: true, duration: 0.6, easeLinearity: 0.6 })
      } catch {}
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('oid', ownerInfo.oid)
    params.set('filterOwner', '1')
    params.set('_', Date.now().toString())
  
    const newUrl = `/user?${params.toString()}`
    const currentUrl = `${window.location.pathname}${window.location.search}`
  
    // ✅ Update URL manually to avoid reload
    if (newUrl !== currentUrl) {
      window.history.replaceState(null, '', newUrl)
    }
  
    setSelected(null)
  }
  
  
  

  return (
    <>
      {(() => {
        const groups = new Map<string, { base: [number, number]; items: VehicleResponse[] }>()
        for (const v of vehicles) {
          const coords = getVehicleCoordinates(v)
          if (!coords) continue
          const key = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`
          const group = groups.get(key)
          if (group) group.items.push(v)
          else groups.set(key, { base: coords, items: [v] })
        }

        return Array.from(groups.values()).map(({ base, items }) => {
          const sample = items[0]
          const icon = createVehicleIcon(sample, markerVariant)
          return (
            <Marker
              key={`${base[0]},${base[1]}`}
              position={base}
              {...(icon ? { icon } : {})}
              interactive={interactive}
              keyboard={interactive}
              eventHandlers={{
                click: () => {
                  if (!showPopups) return
                  setSelected({ base, items })
                }
              }}
            />
          )
        })
      })()}

      {showPopups && selected && anchorPos && (
        <Popover open={true} onOpenChange={(o) => { if (!o) setSelected(null) }}>
          <div
            className="absolute z-[1000]"
            style={{ left: anchorPos.x, top: anchorPos.y }}
          >
            <PopoverAnchor asChild>
              <span className="block w-0 h-0" />
            </PopoverAnchor>
          </div>
          <PopoverContent sideOffset={8} className="w-[220px] p-3 rounded-md">
            
            {selected.items[0].garage_location_name && (
              <div className="flex items-center text-sm text-gray-900 mb-2 line-clamp-2">
                <MapPin className="w-3 h-3 mr-1" />
                {selected.items[0].garage_location_name}
              </div>
            )}

            {ownerInfo.ownerName && (
              <div className="flex items-center text-sm text-gray-900 mb-2 line-clamp-2">
                <User className="w-3 h-3 mr-1" /> {ownerInfo.ownerName}
              </div>
            )}
            
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {selected.items.length} vehicle{selected.items.length > 1 ? 's' : ''} available
            </div>
            <div className="text-xs text-gray-600 mb-3">
              From ₱{Math.min(...selected.items.map(v => v.rate_per_day)).toLocaleString()} / day
            </div>

            <button
              onClick={handleViewCars}
              className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700"
            >
              View cars here
            </button>
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}
