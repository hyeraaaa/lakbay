"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

// Throttle location updates to prevent excessive re-renders (max once per 500ms)
function useThrottledUpdate(callback: (location: LiveLocation) => void, delay: number = 500) {
  const lastUpdateRef = useRef<number>(0)
  const pendingUpdateRef = useRef<LiveLocation | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledFn = useCallback((location: LiveLocation) => {
    const now = Date.now()
    pendingUpdateRef.current = location

    if (now - lastUpdateRef.current >= delay) {
      lastUpdateRef.current = now
      callbackRef.current(location)
      pendingUpdateRef.current = null
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else if (!timeoutRef.current) {
      const remaining = delay - (now - lastUpdateRef.current)
      timeoutRef.current = setTimeout(() => {
        if (pendingUpdateRef.current) {
          lastUpdateRef.current = Date.now()
          callbackRef.current(pendingUpdateRef.current)
          pendingUpdateRef.current = null
        }
        timeoutRef.current = null
      }, remaining)
    }
  }, [delay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  return throttledFn
}

export function useVehicleLiveLocation(vehicleId?: number | null) {
  const [hasTrackingDevice, setHasTrackingDevice] = useState<boolean | null>(null)
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)
  const [lastKnownLocation, setLastKnownLocation] = useState<LiveLocation | null>(null)
  const [initialLoading, setInitialLoading] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef<{
    handleLocationPayload: (payload: LocationPayload) => void
    handleConnect: () => void
    handleDisconnect: () => void
    handleConnectError: () => void
  } | null>(null)

  // Throttled update function to prevent excessive state updates
  const throttledUpdateLocation = useThrottledUpdate((location) => {
    setLiveLocation(location)
    setLastKnownLocation(location)
  }, 500) // Update max once per 500ms

  // Store throttled update ref for cleanup
  const throttledUpdateRef = useRef<ReturnType<typeof useThrottledUpdate> | null>(null)
  throttledUpdateRef.current = throttledUpdateLocation

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
              const initialLocation = {
                latitude: lat,
                longitude: lng
              }
              setLastKnownLocation(initialLocation)
              // Also set as live location initially
              setLiveLocation(initialLocation)
            }
          }
        }
        
        if (!activeExists) {
          setInitialLoading(false)
          return
        }

        // Clean up any existing socket connection first
        if (socketRef.current) {
          try {
            socketRef.current.removeAllListeners()
            socketRef.current.disconnect()
          } catch {}
          socketRef.current = null
        }

        // Then establish socket connection for live updates
        const baseApi = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const socketBase = baseApi.replace(/\/?api\/?$/, "")
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : undefined
        const socket = io(`${socketBase}/tracking`, {
          transports: ["websocket", "polling"],
          auth: { token },
          // Add connection options to prevent memory leaks
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
        socketRef.current = socket

        // Create handler functions
        const handleConnect = () => {
          if (!cancelled && socketRef.current) {
            socketRef.current.emit("join_vehicle_tracking", { vehicleId })
          }
        }

        const handleLocationPayload = (payload: LocationPayload) => {
          if (cancelled) return
          const loc = payload?.location
          const lat = Number(loc?.latitude)
          const lng = Number(loc?.longitude)
          if (Number.isFinite(lat) && Number.isFinite(lng) && throttledUpdateRef.current) {
            throttledUpdateRef.current({ latitude: lat, longitude: lng })
          }
        }

        const handleDisconnect = () => {
          // Connection lost - keep last known location
        }

        const handleConnectError = () => {
          // Connection error - keep last known location
        }

        // Store handlers for cleanup
        handlersRef.current = {
          handleLocationPayload,
          handleConnect,
          handleDisconnect,
          handleConnectError
        }

        // Attach event listeners
        socket.on("connect", handleConnect)
        socket.on("current_location", handleLocationPayload)
        socket.on("tracking_update", handleLocationPayload)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)
        
        setInitialLoading(false)
      } catch (err) {
        if (!cancelled) {
          setHasTrackingDevice(false)
          setInitialLoading(false)
        }
      }
    }

    connect()
    
    // Cleanup function - properly remove all listeners before disconnecting
    return () => {
      cancelled = true
      if (socketRef.current) {
        try {
          // Remove all event listeners to prevent memory leaks
          socketRef.current.removeAllListeners("connect")
          socketRef.current.removeAllListeners("current_location")
          socketRef.current.removeAllListeners("tracking_update")
          socketRef.current.removeAllListeners("disconnect")
          socketRef.current.removeAllListeners("connect_error")
          socketRef.current.disconnect()
        } catch {}
        socketRef.current = null
      }
      handlersRef.current = null
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


