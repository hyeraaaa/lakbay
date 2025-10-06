import { useEffect, useState } from 'react'
import { vehicleService, type VehicleResponse } from '@/services/vehicleServices'

export function useMapVehicle(userId: string | undefined) {
  const [mapVehicle, setMapVehicle] = useState<VehicleResponse | null>(null)

  useEffect(() => {
    let active = true
    const loadMapVehicle = async () => {
      try {
        if (!userId) return
        const all = await vehicleService.getAllVehicles({ owner_id: userId })
        const list: VehicleResponse[] = Array.isArray(all) ? all : []
        const filtered = list.filter(v => v.availability !== 'pending_registration')
        const withCoords = filtered.find(v => Number.isFinite(Number(v.garage_latitude)) && Number.isFinite(Number(v.garage_longitude))) || null
        if (active) setMapVehicle(withCoords)
      } catch {
        if (active) setMapVehicle(null)
      }
    }
    loadMapVehicle()
    return () => { active = false }
  }, [userId])

  return { mapVehicle }
}

 