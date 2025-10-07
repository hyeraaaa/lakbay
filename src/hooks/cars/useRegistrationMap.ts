"use client"

import { useEffect, useState } from "react"
import { registrationService } from "@/services/registrationService"

type RegistrationEntry = { hasRegistration: boolean; status?: string }

export function useRegistrationMap(vehicleIds: number[]) {
  const [registrationMap, setRegistrationMap] = useState<Record<number, RegistrationEntry>>({})

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const updates = await Promise.all(
          vehicleIds.map(async (id) => {
            try {
              const status = await registrationService.getRegistrationStatus(id)
              return { id, hasRegistration: !!status.hasRegistration, status: status.registration?.status }
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
  }, [vehicleIds])

  return { registrationMap, setRegistrationMap }
}


