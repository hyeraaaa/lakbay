"use client"

import { useEffect, useState } from "react"
import { vehicleService } from "@/services/vehicleServices"

export function useVehicleTrackers(vehicleIds: number[]) {
  const [trackerMap, setTrackerMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const updates = await Promise.all(
          vehicleIds.map(async (id) => {
            try {
              const devices = await vehicleService.getVehicleGPSDevices(id)
              return { id, hasTracker: Array.isArray(devices) && devices.length > 0 }
            } catch {
              return { id, hasTracker: false }
            }
          })
        )
        if (!active) return
        setTrackerMap((prev) => {
          const next: Record<number, boolean> = { ...prev }
          for (const u of updates) next[u.id] = u.hasTracker
          return next
        })
      } catch {}
    }
    run()
    return () => { active = false }
  }, [vehicleIds])

  return { trackerMap, setTrackerMap }
}


