"use client"
import { useEffect, useState } from "react"

export type GeocodeState = {
  center: [number, number] | null
  zoom: number | null
  isGeocoding: boolean
  error: string | null
  isReady: boolean
}

export function useGeocodeLocation(city?: string | null, province?: string | null): GeocodeState {
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [zoom, setZoom] = useState<number | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean>(true)

  useEffect(() => {
    if (!city && !province) {
      setCenter(null)
      setZoom(null)
      setIsGeocoding(false)
      setError(null)
      setIsReady(true)
      return
    }
    const q = [city, province, 'Philippines'].filter(Boolean).join(', ')
    let aborted = false
    const run = async () => {
      try {
        setIsGeocoding(true)
        setIsReady(false)
        setError(null)
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(q)}`)
        if (!resp.ok) throw new Error('Failed to geocode')
        const results = await resp.json()
        const best = Array.isArray(results) ? results[0] : null
        if (!best || !best.lat || !best.lon) throw new Error('Location not found')
        if (aborted) return
        const lat = parseFloat(best.lat)
        const lon = parseFloat(best.lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setCenter([lat, lon])
          // Use gentler defaults: city-level ~13, province-only ~10
          const hasCity = !!city && String(city).trim().length > 0
          const hasProvince = !!province && String(province).trim().length > 0
          const z = hasCity ? 13 : (hasProvince ? 10 : 12)
          setZoom(z)
        }
      } catch (e: unknown) {
        if (!aborted) setError(e instanceof Error ? e.message : 'Geocoding error')
      } finally {
        if (!aborted) {
          setIsGeocoding(false)
          // Mark ready on next paint so map can apply center before list fetches
          const finish = () => setIsReady(true)
          if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
            requestAnimationFrame(() => requestAnimationFrame(finish))
          } else {
            setTimeout(finish, 0)
          }
        }
      }
    }
    run()
    return () => { aborted = true }
  }, [city, province])

  return { center, zoom, isGeocoding, error, isReady }
}


