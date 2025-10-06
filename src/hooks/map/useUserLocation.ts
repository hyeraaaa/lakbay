"use client"
import { useCallback, useRef, useState } from "react"

export type UserLocationState = {
  coords: [number, number] | null
  accuracy: number | null
  isActive: boolean
  error: string | null
  toggle: () => Promise<void>
  disable: () => void
}

export function useUserLocation(): UserLocationState {
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const disable = useCallback(() => {
    try { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current) } catch {}
    watchIdRef.current = null
    setCoords(null)
    setAccuracy(null)
  }, [])

  const toggle = useCallback(async () => {
    setError(null)
    if (coords) {
      disable()
      return
    }
    try {
      if (!('geolocation' in navigator)) {
        setError('Geolocation not supported')
        return
      }
      // seed
      try {
        const seed: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        })
        setCoords([seed.coords.latitude, seed.coords.longitude])
        setAccuracy(seed.coords.accuracy || null)
      } catch {}

      // refine
      let best: GeolocationPosition | null = null
      const stopWatch = () => {
        try { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current) } catch {}
        watchIdRef.current = null
      }
      await new Promise<void>((resolve) => {
        const timeoutId = setTimeout(() => {
          stopWatch()
          return resolve()
        }, 15000)
        watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
          const acc = pos.coords.accuracy ?? Infinity
          const bestAcc = best?.coords.accuracy ?? Infinity
          if (!best || acc < bestAcc) {
            best = pos
            setCoords([pos.coords.latitude, pos.coords.longitude])
            setAccuracy(acc)
          }
          if (acc <= 20) {
            clearTimeout(timeoutId)
            stopWatch()
            resolve()
          }
        }, () => {
          clearTimeout(timeoutId)
          stopWatch()
          resolve()
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get your location')
    }
  }, [coords, disable])

  return {
    coords,
    accuracy,
    isActive: !!coords,
    error,
    toggle,
    disable,
  }
}


