"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useVehicles } from '@/hooks/useVehicles'
import VehiclesTable from '@/components/cars/vehiclesTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Car, CheckCircle, CarFront, FileClock } from 'lucide-react'
import { AdminStatsCard, type StatItem } from '@/components/admin/AdminStatsCard'

type VehicleTypeFilter = 'all' | 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'electric' | 'hybrid'

const vehicleTypeLabels: Record<VehicleTypeFilter, string> = {
  all: 'All',
  sedan: 'Sedan',
  suv: 'SUV',
  truck: 'Truck',
  van: 'Van',
  luxury: 'Luxury',
  electric: 'Electric',
  hybrid: 'Hybrid',
}

export default function AdminVehiclesPage() {
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

  const stats = useMemo(() => {
    const total = vehicles.length
    const byAvailability = vehicles.reduce(
      (acc, v) => {
        const key = (v.availability || '').toLowerCase().replace(/\s+/g, '_')
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return {
      total,
      available: byAvailability['available'] || 0,
      rented: byAvailability['rented'] || 0,
      pending_registration: byAvailability['pending_registration'] || 0,
    }
  }, [vehicles])

  const statsItems = useMemo<StatItem[]>(() => [
    { label: "Total", value: stats.total, icon: Car },
    { label: "Available", value: stats.available, icon: CheckCircle },
    { label: "Rented", value: stats.rented, icon: CarFront },
    { label: "Pending Registration", value: stats.pending_registration, icon: FileClock },
  ], [stats])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <p className="text-muted-foreground">Browse and manage all vehicles in the system</p>
      </div>

      {/* Stats */}
      <AdminStatsCard stats={statsItems} loading={isLoading} />

      <Card>
        <CardContent>
          {/* Search and Availability Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by brand, model, plate number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="bg-white border-neutral-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="pending_registration">Pending Registration</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Type Badge Filters */}
          <div className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-4 ${!isLoading && vehicles.length > 0 ? '' : 'border-b'}`}>
            {(Object.keys(vehicleTypeLabels) as VehicleTypeFilter[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="focus:outline-none"
              >
                <Badge
                  className="rounded-sm px-3 py-1"
                  variant={typeFilter === type ? "black" : "outline"}
                >
                  {vehicleTypeLabels[type]}
                </Badge>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-48 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="mb-4 text-muted-foreground/40"
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="25" y="55" width="70" height="35" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M35 55L45 40H75L85 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="45" cy="75" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="75" cy="75" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M35 55H85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="50" y="60" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                <path d="M60 60V72" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {debouncedSearchQuery.trim() || availabilityFilter !== 'all' || typeFilter !== 'all'
                  ? 'No vehicles match the selected filter or search query.' 
                  : 'No vehicles found.'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {debouncedSearchQuery.trim() || availabilityFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms' 
                  : 'Vehicles will appear here once they are registered'}
              </p>
            </div>
          ) : (
            <div className="p-0">
              <VehiclesTable vehicles={vehicles} onChange={refetch} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
