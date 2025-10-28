import { useEffect, useState } from 'react'
import { vehicleService, type VehicleResponse } from '@/services/vehicleServices'
import { profileService, type UserProfileResponse } from '@/services/profileServices'

export function useMapVehicle(userId: string | undefined) {
  const [mapVehicle, setMapVehicle] = useState<VehicleResponse | null>(null)
  const [profileLocation, setProfileLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null)

  useEffect(() => {
    let active = true
    const loadMapData = async () => {
      try {
        if (!userId) return
        
        // First try to get vehicles with garage coordinates
        const all = await vehicleService.getAllVehicles({ owner_id: userId })
        const list: VehicleResponse[] = Array.isArray(all) ? all : []
        const filtered = list.filter(v => v.availability !== 'pending_registration')
        const withCoords = filtered.find(v => Number.isFinite(Number(v.garage_latitude)) && Number.isFinite(Number(v.garage_longitude)))
        
        if (withCoords) {
          if (active) setMapVehicle(withCoords)
          return
        }
        
        // If no vehicles with coordinates, try to get profile garage location
        const { ok, data: profile } = await profileService.getPublicProfile(userId)
        if (ok && profile && 
            Number.isFinite(Number(profile.garage_latitude)) && 
            Number.isFinite(Number(profile.garage_longitude))) {
          if (active) {
            setProfileLocation({
              latitude: Number(profile.garage_latitude),
              longitude: Number(profile.garage_longitude),
              name: profile.garage_location_name || undefined
            })
          }
        }
      } catch {
        if (active) {
          setMapVehicle(null)
          setProfileLocation(null)
        }
      }
    }
    loadMapData()
    return () => { active = false }
  }, [userId])

  return { mapVehicle, profileLocation }
}

 