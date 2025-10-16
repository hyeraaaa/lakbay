"use client"
import { Circle, Marker, Popup } from "react-leaflet"
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { User as UserIcon } from 'lucide-react'

function createUserIcon() {
  const userSvg = renderToStaticMarkup(<UserIcon size={18} color="#ffffff" strokeWidth={2.25} />)
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div>
        <div class="bg-blue-600 border-2 border-blue-700 rounded-full w-9 h-9 flex items-center justify-center shadow">${userSvg}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  })
}

export default function UserLocationLayer({ coords, accuracy }: { coords: [number, number] | null; accuracy: number | null }) {
  if (!coords) return null
  return (
    <>
      <Marker position={coords} icon={createUserIcon()}>
        <Popup>You are here</Popup>
      </Marker>
      {accuracy && Number.isFinite(accuracy) && (
        <Circle center={coords} radius={accuracy} pathOptions={{ color: '#2563eb', weight: 1, opacity: 0.3, fillOpacity: 0.05 }} />
      )}
    </>
  )
}


