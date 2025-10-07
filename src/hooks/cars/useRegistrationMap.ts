"use client"

import { useEffect, useState } from "react"
import { registrationService } from "@/services/registrationService"

type RegistrationEntry = { hasRegistration: boolean; status?: string }

export function useRegistrationMap(vehicleIds: number[], vehicleAvailabilityMap?: Record<number, string>) {
  const [registrationMap, setRegistrationMap] = useState<Record<number, RegistrationEntry>>({})

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const updates = await Promise.all(
          vehicleIds.map(async (id) => {
            try {
              const status = await registrationService.getRegistrationStatus(id)
              
              // If vehicle is pending_registration, treat as no registration regardless of existing records
              // This handles the case where critical fields changed and old registration records exist
              const vehicleAvailability = vehicleAvailabilityMap?.[id]
              const isPendingRegistration = vehicleAvailability === 'pending_registration'
              
              return { 
                id, 
                hasRegistration: !isPendingRegistration && !!status.hasRegistration, 
                status: !isPendingRegistration ? status.registration?.status : undefined 
              }
            } catch {
              return { id, hasRegistration: false, status: undefined }
            }
          })
        )
        if (!active) return
        setRegistrationMap((prev) => {
          const next: Record<number, RegistrationEntry> = { ...prev }
          for (const u of updates) next[u.id] = { hasRegistration: u.hasRegistration, status: u.status }
          return next
        })
      } catch {}
    }
    run()
    return () => { active = false }
  }, [vehicleIds, vehicleAvailabilityMap])

  return { registrationMap, setRegistrationMap }
}


