"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { vehicleService } from "@/services/vehicleServices"

export type LiveLocation = {
  latitude: number
  longitude: number
}

type LocationPayload = {
  location?: {
    latitude: number | string
    longitude: number | string
  }
}

export function useVehicleLiveLocation(vehicleId?: number | null) {
  const [hasTrackingDevice, setHasTrackingDevice] = useState<boolean | null>(null)
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)
  const [lastKnownLocation, setLastKnownLocation] = useState<LiveLocation | null>(null)
  const [initialLoading, setInitialLoading] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      if (!vehicleId) return
      
      setInitialLoading(true)
      
      try {
        // First, check if GPS devices exist and get their last tracking data
        const devices = await vehicleService.getVehicleGPSDevices(vehicleId)
        if (cancelled) return
        const activeExists = Array.isArray(devices) && devices.some(d => d.is_active !== false)
        setHasTrackingDevice(activeExists)
        
        // Find the most recent tracking data from active devices
        const activeDevices = devices.filter(d => d.is_active && d.last_tracking)
        if (activeDevices.length > 0) {
          // Get the most recent tracking data
          const mostRecentDevice = activeDevices.reduce((latest, current) => {
            if (!latest.last_tracking) return current
            if (!current.last_tracking) return latest
            return new Date(current.last_tracking.gps_timestamp) > new Date(latest.last_tracking.gps_timestamp) 
              ? current : latest
          })
          
          
          if (mostRecentDevice.last_tracking) {
            const trackingData = mostRecentDevice.last_tracking
            const lat = Number(trackingData.latitude)
            const lng = Number(trackingData.longitude)
            
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setLastKnownLocation({
                latitude: lat,
                longitude: lng
              })
            }
          }
        }
        
        if (!activeExists) {
          setInitialLoading(false)
          return
        }

        // Then establish socket connection for live updates
        const baseApi = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const socketBase = baseApi.replace(/\/?api\/?$/, "")
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : undefined
        const socket = io(`${socketBase}/tracking`, {
          transports: ["websocket", "polling"],
          auth: { token },
        })
        socketRef.current = socket

        socket.on("connect", () => {
          socket.emit("join_vehicle_tracking", { vehicleId })
        })

        const handleLocationPayload = (payload: LocationPayload) => {
          const loc = payload?.location
          const lat = Number(loc?.latitude)
          const lng = Number(loc?.longitude)
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setLiveLocation({ latitude: lat, longitude: lng })
            // Also update last known location with the new data
            setLastKnownLocation({ latitude: lat, longitude: lng })
          }
        }

        socket.on("current_location", handleLocationPayload)
        socket.on("tracking_update", handleLocationPayload)

        // Optional: surface socket availability state via hasTrackingDevice if needed
        socket.on("disconnect", () => {})
        socket.on("connect_error", () => {})
        
        setInitialLoading(false)
      } catch (err) {
        setHasTrackingDevice(false)
        setInitialLoading(false)
      }
    }

    connect()
    return () => {
      cancelled = true
      if (socketRef.current) {
        try { socketRef.current.disconnect() } catch {}
        socketRef.current = null
      }
    }
  }, [vehicleId])

  // Return live location if available, otherwise last known location
  const displayLocation = liveLocation || lastKnownLocation

  return { 
    hasTrackingDevice, 
    liveLocation: displayLocation,
    initialLoading,
    isLive: Boolean(liveLocation)
  }
}


