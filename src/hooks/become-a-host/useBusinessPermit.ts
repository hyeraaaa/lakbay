import { useEffect, useRef, useState } from "react"

export function useBusinessPermit() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [barangay, setBarangay] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [locateError, setLocateError] = useState("")
  const [geoError, setGeoError] = useState("")
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [mapClicked, setMapClicked] = useState(false) // Track if user clicked on map
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Debounced forward geocoding of the typed address
  useEffect(() => {
    const p = province.trim()
    const c = city.trim()
    const b = barangay.trim()
    if (!p && !c && !b) {
      setCoords(null)
      setGeoError("")
      setMapClicked(false) // Reset map clicked state when address fields are cleared
      return
    }
    const controller = new AbortController()
    const t = window.setTimeout(async () => {
      try {
        setGeoLoading(true)
        setGeoError("")
        const q = [b, c, p].filter(Boolean).join(", ") + ", Philippines"
        const params = new URLSearchParams({
          q,
          format: 'json',
          addressdetails: '1',
          countrycodes: 'ph',
          limit: '1',
          'accept-language': 'en-PH',
        })
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to geocode address')
        const data: Array<{ lat: string; lon: string }> = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const lat = Number(data[0].lat)
          const lon = Number(data[0].lon)
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            setCoords([lat, lon])
            setMapClicked(false) // This is geocoded coordinates, not map-clicked
          } else {
            setCoords(null)
          }
        } else {
          setCoords(null)
          setGeoError('Address not found. Please refine the details.')
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setGeoError('Could not geocode the address right now')
        }
      } finally {
        setGeoLoading(false)
      }
    }, 1000)
    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [province, city, barangay])

  const locateCurrent = async () => {
    setLocateError("")
    if (!('geolocation' in navigator)) {
      setLocateError('Geolocation not supported by your browser')
      return
    }
    setIsLocating(true)
    try {
      let seed: GeolocationPosition | null = null
      try {
        seed = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0,
          })
        })
      } catch {}

      let best: GeolocationPosition | null = seed
      if (seed) {
        setCoords([seed.coords.latitude, seed.coords.longitude])
        if (typeof seed.coords.accuracy === 'number' && seed.coords.accuracy > 100) {
          setLocateError('Location may be approximate. Waiting for a better fix...')
        }
      }

      await new Promise<void>((resolve) => {
        const stop = (id: number | null, timeoutId: number | null) => {
          try { if (id != null) navigator.geolocation.clearWatch(id) } catch {}
          if (timeoutId != null) clearTimeout(timeoutId)
        }
        const timeoutId = window.setTimeout(async () => {
          stop(watchId, timeoutId)
          resolve()
        }, 12000)
        const watchId = navigator.geolocation.watchPosition(async (pos) => {
          const acc = pos.coords.accuracy ?? Infinity
          const bestAcc = best?.coords.accuracy ?? Infinity
          if (!best || acc < bestAcc) {
            best = pos
            setCoords([pos.coords.latitude, pos.coords.longitude])
            setMapClicked(false) // GPS location is not map-clicked
            if (acc <= 50) {
              setLocateError("")
            }
          }
          if (acc <= 25) {
            stop(watchId, timeoutId)
            resolve()
          }
        }, () => {
          stop(watchId, timeoutId)
          resolve()
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get your location'
      setLocateError(msg)
    } finally {
      setIsLocating(false)
    }
  }

  const onMapPick = (lat: number, lon: number) => {
    setGeoError("")
    setCoords([lat, lon])
    setMapClicked(true) // Mark that user clicked on map for precise coordinates
  }

  const isLocationProvided = Boolean(coords || province.trim() || city.trim() || barangay.trim())

  const getLocationString = () => {
    // Always prefer human-readable address fields for garage_location_name
    const p = province.trim()
    const c = city.trim()
    const b = barangay.trim()
    const combined = [b, c, p].filter(Boolean).join(", ")
    if (combined) return combined
    
    // Fall back to coordinates only if no address fields are filled
    if (coords) return `${coords[0]}, ${coords[1]}`
    return ""
  }

  const getLocationForSubmission = () => {
    // Always send the address fields for garage_location_name (human-readable)
    return getLocationString()
  }

  const getCoordinatesForSubmission = () => {
    // Always send coordinates when available; they reflect the current pin position
    if (coords) {
      return `${coords[0]}, ${coords[1]}`
    }
    return null
  }

  return {
    // state
    selectedFile,
    dragActive,
    province,
    city,
    barangay,
    isLocating,
    locateError,
    geoError,
    coords,
    geoLoading,

    // refs
    fileInputRef,

    // setters
    setSelectedFile,
    setProvince,
    setCity,
    setBarangay,

    // handlers
    handleDrag,
    handleDrop,
    handleFileSelect,
    removeFile,
    locateCurrent,
    onMapPick,

    // derived
    isLocationProvided,
    getLocationString,
    getLocationForSubmission,
    getCoordinatesForSubmission,
  }
}

export default useBusinessPermit


