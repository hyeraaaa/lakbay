"use client"

import { useEffect, useState } from "react"
import { vehicleService, type VehicleGPSDevice } from "@/services/vehicleServices"

export function useTrackingDetails(vehicleIds: number[]) {
  const [deviceMap, setDeviceMap] = useState<Record<number, VehicleGPSDevice | null>>({})
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true
    const run = async () => {
      const ids = [...new Set(vehicleIds)].filter(Boolean)
      if (ids.length === 0) return
      setLoadingMap((prev) => {
        const next = { ...prev }
        for (const id of ids) next[id] = true
        return next
      })
      try {
        const updates = await Promise.all(
          ids.map(async (id) => {
            try {
              const devices = await vehicleService.getVehicleGPSDevices(id)
              const first = Array.isArray(devices) && devices.length > 0 ? devices[0] : null
              return { id, device: first }
            } catch {
              return { id, device: null }
            }
          })
        )
        if (!active) return
        setDeviceMap((prev) => {
          const next: Record<number, VehicleGPSDevice | null> = { ...prev }
          for (const u of updates) next[u.id] = u.device
          return next
        })
      } finally {
        if (active) {
          setLoadingMap((prev) => {
            const next = { ...prev }
            for (const id of ids) next[id] = false
            return next
          })
        }
      }
    }
    run()
    return () => { active = false }
  }, [vehicleIds])

  return { deviceMap, loadingMap, setDeviceMap }
}


