import { useCallback, useEffect, useState } from 'react'
import { vehicleService, type VehicleResponse } from '@/services/vehicleServices'

export function useOwnerVehicles(userId: string | undefined, initialLimit: number = 4) {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(true)
  const [showAllVehicles, setShowAllVehicles] = useState<boolean>(false)
  const [hasMoreVehicles, setHasMoreVehicles] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const fetchVehicles = async (limit?: number) => {
      try {
        if (!userId) return
        const params: Record<string, string | number | undefined> = { owner_id: userId }
        if (limit) params.limit = limit
        const data = await vehicleService.getAllVehicles(params)
        const list = Array.isArray(data) ? data : []
        const filtered = list.filter(v => v.availability !== 'pending_registration')
        if (isMounted) {
          setHasMoreVehicles(filtered.length > 3)
          setVehicles(limit ? filtered.slice(0, 3) : filtered)
        }
      } catch (e) {
        if (isMounted) setVehicles([])
      } finally {
        if (isMounted) setIsLoadingVehicles(false)
      }
    }
    setIsLoadingVehicles(true)
    setShowAllVehicles(false)
    if (userId) fetchVehicles(initialLimit)
    return () => { isMounted = false }
  }, [userId, initialLimit])

  const handleViewAllVehicles = useCallback(async () => {
    try {
      setIsLoadingVehicles(true)
      setShowAllVehicles(true)
      if (!userId) return
      const data = await vehicleService.getAllVehicles({ owner_id: userId })
      const list = Array.isArray(data) ? data : []
      const filtered = list.filter(v => v.availability !== 'pending_registration')
      setVehicles(filtered)
    } catch {
      // keep existing vehicles on error
    } finally {
      setIsLoadingVehicles(false)
    }
  }, [userId])

  return { vehicles, isLoadingVehicles, showAllVehicles, hasMoreVehicles, handleViewAllVehicles }
}

 