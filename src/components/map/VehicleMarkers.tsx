"use client"
import { Marker, Popup } from "react-leaflet"
import type { ReactNode } from 'react'
import { VehicleResponse } from "@/services/vehicleServices"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"
import { getVehiclePrimaryImageUrl } from "@/lib/imageUtils"
import { renderToStaticMarkup } from 'react-dom/server'
import { CarFront } from 'lucide-react'
import Image from "next/image"
import L from 'leaflet'

function createVehicleIcon(vehicle: VehicleResponse, variant: 'price' | 'pin') {
  if (variant === 'pin') {
    const carSvg = renderToStaticMarkup(<CarFront size={18} color="#1f2937" strokeWidth={2.25} />)
    return L.divIcon({
      className: 'custom-vehicle-marker',
      html: `
        <div class="vehicle-marker vehicle-marker--simple">
          <div class="vehicle-marker-icon">${carSvg}</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    })
  }
  const carSvg = renderToStaticMarkup(<CarFront size={16} color="#1f2937" strokeWidth={2.25} />)
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="vehicle-marker">
        <div class="vehicle-marker-icon">${carSvg}</div>
        <div class="vehicle-marker-price">₱${vehicle.rate_per_day}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

function getVehicleCoordinates(vehicle: VehicleResponse): [number, number] | null {
  const latNum = vehicle.garage_latitude != null ? Number(vehicle.garage_latitude) : NaN
  const lonNum = vehicle.garage_longitude != null ? Number(vehicle.garage_longitude) : NaN
  if (Number.isFinite(latNum) && Number.isFinite(lonNum)) return [latNum, lonNum]
  return null
}

// Convert meter offsets to lat/lng deltas at a given latitude
function metersToLatLngDelta(lat: number, dxMeters: number, dyMeters: number): [number, number] {
  const oneDegreeLatMeters = 111_320; // average meters per degree latitude
  const latRad = (lat * Math.PI) / 180;
  const oneDegreeLngMeters = 111_320 * Math.cos(latRad);
  const dLat = dyMeters / oneDegreeLatMeters;
  const dLng = oneDegreeLngMeters === 0 ? 0 : dxMeters / oneDegreeLngMeters;
  return [dLat, dLng];
}

// For vehicles that share the exact same coordinates, spread them in a small ring
function getOffsetPosition(base: [number, number], index: number, total: number): [number, number] {
  if (total <= 1) return base;
  // Radius in meters (kept small so markers still point to the original spot)
  const radiusMeters = 12; // tweak if needed
  const angle = (2 * Math.PI * index) / total;
  const dx = Math.cos(angle) * radiusMeters;
  const dy = Math.sin(angle) * radiusMeters;
  const [dLat, dLng] = metersToLatLngDelta(base[0], dx, dy);
  return [base[0] + dLat, base[1] + dLng];
}

type VehicleMarkersProps = {
  vehicles: VehicleResponse[]
  markerVariant?: 'price' | 'pin'
  interactive?: boolean
  showPopups?: boolean
}

export default function VehicleMarkers({ vehicles, markerVariant = 'price', interactive = true, showPopups = true }: VehicleMarkersProps) {
  return (
    <>
      {(() => {
        // Group vehicles by exact lat/lng to detect overlaps
        const groups = new Map<string, { base: [number, number]; items: VehicleResponse[] }>()
        for (const v of vehicles) {
          const coords = getVehicleCoordinates(v)
          if (!coords) continue
          // Use fixed precision to avoid floating precision mismatches for effectively-identical coords
          const key = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`
          const group = groups.get(key)
          if (group) {
            group.items.push(v)
          } else {
            groups.set(key, { base: coords, items: [v] })
          }
        }

        const markers: ReactNode[] = []
        for (const { base, items } of groups.values()) {
          items.forEach((vehicle, index) => {
            const position = getOffsetPosition(base, index, items.length)
            const imageUrl = getVehiclePrimaryImageUrl(vehicle)
            const hostName = vehicle.users ? `${vehicle.users.first_name} ${vehicle.users.last_name}` : "Unknown Host"
            markers.push(
              <Marker key={vehicle.vehicle_id} position={position} icon={createVehicleIcon(vehicle, markerVariant)} interactive={interactive} keyboard={interactive}>
                {showPopups && (
                <Popup>
                  <div className="vehicle-popup">
                    <div className="flex gap-3">
                      {imageUrl ? (
                        <div className="w-16 h-12 relative">
                          <Image
                            src={imageUrl}
                            alt={vehicle.brand}
                            width={64}
                            height={48}
                            className="object-cover rounded"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-lg">🚗</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{vehicle.brand} {vehicle.model} {vehicle.year}</h3>
                        <p className="text-xs text-gray-600 mb-1">Host: {hostName}</p>
                        <p className="text-xs text-gray-600 mb-2">{vehicle.seats} seats • {normalizeTransmissionLabel(vehicle.transmission)} • {vehicle.fuel_type || 'Gasoline'}</p>
                        <p className="font-bold text-sm text-green-600">₱{vehicle.rate_per_day.toLocaleString()}/day</p>
                      </div>
                    </div>
                  </div>
                </Popup>
                )}
              </Marker>
            )
          })
        }
        return markers
      })()}
    </>
  )
}


