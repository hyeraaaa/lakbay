import { useState, useCallback, useEffect, useRef } from 'react'
import { vehicleService } from '@/services/vehicleServices'

type VehicleStatistics = {
  total: number
  available: number
  rented: number
  pending_registration: number
}

export function useVehicleStatistics() {
  const [statistics, setStatistics] = useState<VehicleStatistics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchStatistics = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setLoading(true)
    try {
      // Fetch all vehicles without any filters to get overall statistics
      const allVehicles = await vehicleService.getAllVehicles({
        availability: 'all', // Get all availability statuses
      })
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return
      }
      
      // Optimize: use a single pass to calculate all statistics
      let total = 0
      let available = 0
      let rented = 0
      let pending_registration = 0

      for (const vehicle of allVehicles) {
        total++
        const availability = (vehicle.availability || '').toLowerCase().replace(/\s+/g, '_')
        if (availability === 'available') {
          available++
        } else if (availability === 'rented') {
          rented++
        } else if (availability === 'pending_registration') {
          pending_registration++
        }
      }
      
      setStatistics({
        total,
        available,
        rented,
        pending_registration,
      })
    } catch (e) {
      // Don't set error state if request was aborted
      if (abortController.signal.aborted) {
        return
      }
      console.error('Failed to fetch vehicle statistics:', e)
      setStatistics({
        total: 0,
        available: 0,
        rented: 0,
        pending_registration: 0,
      })
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchStatistics()
    
    // Cleanup: abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchStatistics])

  return { statistics, loading, fetchStatistics }
}

