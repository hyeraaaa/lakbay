"use client"

import React, { useEffect, useRef, memo } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvent } from "react-leaflet"
import L from "leaflet"

type InlineGarageMapProps = {
  center: [number, number]
  onPick?: (lat: number, lon: number) => void
}

// Fix default Leaflet marker icons for Next.js bundling
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string
}
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SetView: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 15 }) => {
  const map = useMap()
  useEffect(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      // Preserve current zoom to avoid resetting user zoom level on center updates
      const currentZoom = map.getZoom()
      const targetZoom = Number.isFinite(currentZoom) ? currentZoom : zoom
      map.setView(center, targetZoom, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

const ClickToSetCoords: React.FC<{ onPick?: (lat: number, lon: number) => void }> = ({ onPick }) => {
  useMapEvent('click', (e) => {
    const lat = Number(e.latlng.lat)
    const lon = Number(e.latlng.lng)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      onPick?.(lat, lon)
    }
  })
  return null
}

const InlineGarageMap: React.FC<InlineGarageMapProps> = ({ center, onPick }) => {
  const mapKeyRef = useRef<string>('inline-garage-map-' + Math.random().toString(36).slice(2))
  return (
    <MapContainer key={mapKeyRef.current} style={{ height: '100%', width: '100%', zIndex: 0 }} center={center} zoom={15} scrollWheelZoom={true} zoomControl={true} dragging={true} doubleClickZoom={true} className="z-0" attributionControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
      
      <SetView center={center} />
      <ClickToSetCoords onPick={onPick} />
      <Marker position={center} />
    </MapContainer>
  )
}

export default memo(InlineGarageMap)


