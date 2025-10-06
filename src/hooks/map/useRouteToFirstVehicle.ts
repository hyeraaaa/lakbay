"use client"
import { useEffect, useState } from "react"
import { VehicleResponse } from "@/services/vehicleServices"

export function useRouteToFirstVehicle(userCoords: [number, number] | null, vehicles: VehicleResponse[]) {
  const [routeCoords, setRouteCoords] = useState<Array<[number, number]>>([])
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setRouteCoords([])
        setRouteInfo(null)
        if (!userCoords || vehicles.length === 0) return
        const v = vehicles[0]
        const lat = v.garage_latitude != null ? Number(v.garage_latitude) : NaN
        const lon = v.garage_longitude != null ? Number(v.garage_longitude) : NaN
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
        const [uLat, uLon] = userCoords
        const url = `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${lon},${lat}?overview=full&geometries=geojson`
        const resp = await fetch(url)
        if (!resp.ok) return
        const data = await resp.json()
        const route = data?.routes?.[0]
        if (!route) return
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]) as Array<[number, number]>
        setRouteCoords(coords)
        setRouteInfo({ distanceKm: route.distance / 1000, durationMin: route.duration / 60 })
      } catch {}
    }
    run()
  }, [userCoords, vehicles])

  return { routeCoords, routeInfo }
}


