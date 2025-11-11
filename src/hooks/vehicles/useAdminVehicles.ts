import { useState, useEffect, useMemo } from 'react'
import { useVehicles } from '@/hooks/useVehicles'
import { useVehicleStatistics } from './useVehicleStatistics'
import { useInitialLoadTracking } from './useInitialLoadTracking'
import { useScrollPreservation } from './useScrollPreservation'
import { Car, CheckCircle, CarFront, FileClock } from 'lucide-react'
import type { StatItem } from '@/components/admin/AdminStatsCard'

export type VehicleTypeFilter = 'all' | 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'electric' | 'hybrid'

export const vehicleTypeLabels: Record<VehicleTypeFilter, string> = {
  all: 'All',
  sedan: 'Sedan',
  suv: 'SUV',
  truck: 'Truck',
  van: 'Van',
  luxury: 'Luxury',
  electric: 'Electric',
  hybrid: 'Hybrid',
}

export function useAdminVehicles() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<VehicleTypeFilter>('all')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("")

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build API parameters
  const apiParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      availability: availabilityFilter === 'all' ? 'all' : availabilityFilter,
    }

    if (typeFilter !== 'all') {
      params.type = typeFilter
    }

    if (debouncedSearchQuery.trim()) {
      params.q = debouncedSearchQuery.trim()
    }

    return params
  }, [availabilityFilter, typeFilter, debouncedSearchQuery])

  const { vehicles, isLoading, error, refetch } = useVehicles(apiParams)
  const { statistics, loading: statisticsLoading } = useVehicleStatistics()
  
  // Track if initial load is complete (both stats and vehicles have loaded at least once)
  const hasInitialLoadCompleted = useInitialLoadTracking([
    { dataReady: !!statistics, loading: statisticsLoading },
    { dataReady: true, loading: isLoading }, // Vehicles are ready when not loading
  ])

  // Preserve scroll position when filters change (not on initial load)
  useScrollPreservation(
    isLoading,
    hasInitialLoadCompleted,
    [availabilityFilter, typeFilter, debouncedSearchQuery]
  )

  // On initial load: show stats loading until BOTH stats and vehicles are ready
  // After initial load: only show stats loading if stats are actually loading (shouldn't happen on filter changes)
  const showStatsLoading = !hasInitialLoadCompleted && (statisticsLoading || isLoading)
  
  // On initial load: show table loading until BOTH are ready
  // After initial load: show table loading only when vehicles are loading (filter changes)
  const showTableLoading = !hasInitialLoadCompleted 
    ? (isLoading || statisticsLoading) 
    : isLoading

  const statsItems = useMemo<StatItem[]>(() => {
    if (!statistics) return []
    return [
      { label: "Total", value: statistics.total, icon: Car },
      { label: "Available", value: statistics.available, icon: CheckCircle },
      { label: "Rented", value: statistics.rented, icon: CarFront },
      { label: "Pending Registration", value: statistics.pending_registration, icon: FileClock },
    ]
  }, [statistics])

  return {
    // Data
    vehicles,
    statistics,
    statsItems,
    
    // Loading states
    isLoading,
    statisticsLoading,
    showStatsLoading,
    showTableLoading,
    error,
    
    // Filters
    searchQuery,
    setSearchQuery,
    availabilityFilter,
    setAvailabilityFilter,
    typeFilter,
    setTypeFilter,
    debouncedSearchQuery,
    
    // Actions
    refetch,
  }
}

