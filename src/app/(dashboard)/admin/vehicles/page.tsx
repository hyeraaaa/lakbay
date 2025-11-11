"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminVehicles, vehicleTypeLabels, type VehicleTypeFilter } from '@/hooks/vehicles/useAdminVehicles'
import VehiclesTable from '@/components/cars/vehiclesTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { AdminStatsCard } from '@/components/admin/AdminStatsCard'

export default function AdminVehiclesPage() {
  const {
    vehicles,
    statsItems,
    isLoading,
    showStatsLoading,
    showTableLoading,
    error,
    searchQuery,
    setSearchQuery,
    availabilityFilter,
    setAvailabilityFilter,
    typeFilter,
    setTypeFilter,
    debouncedSearchQuery,
    refetch,
  } = useAdminVehicles()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <p className="text-muted-foreground">Browse and manage all vehicles in the system</p>
      </div>

      {/* Stats */}
      <AdminStatsCard stats={statsItems} loading={showStatsLoading} />

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
          <div className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-4 ${showTableLoading ? '' : (!isLoading && vehicles.length > 0 ? '' : 'border-b')}`}>
            {(Object.keys(vehicleTypeLabels) as VehicleTypeFilter[]).map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  e.preventDefault()
                  setTypeFilter(type)
                }}
                className="focus:outline-none"
                type="button"
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

          {showTableLoading ? (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-300">
                <div className="overflow-x-auto">
                  <table className="table-fixed min-w-[900px] w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="h-11 pl-4 text-left">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="h-11 px-4 text-left">
                          <Skeleton className="h-4 w-12" />
                        </th>
                        <th className="h-11 px-4 text-left">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="h-11 px-4 text-left hidden sm:table-cell">
                          <Skeleton className="h-4 w-12" />
                        </th>
                        <th className="h-11 px-4 text-left">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="h-11 px-4 text-left">
                          <Skeleton className="h-4 w-28" />
                        </th>
                        <th className="h-11 px-4 text-left">
                          <Skeleton className="h-4 w-16" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="pl-4 py-4">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </td>
                          <td className="px-4 py-4">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-4 py-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <Skeleton className="h-4 w-12" />
                          </td>
                          <td className="px-4 py-4">
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </td>
                          <td className="px-4 py-4">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </td>
                          <td className="px-4 py-4">
                            <Skeleton className="h-8 w-8 rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-between gap-8">
                <div />
                <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded" />
                    <Skeleton className="h-9 w-9 rounded" />
                    <Skeleton className="h-9 w-9 rounded" />
                    <Skeleton className="h-9 w-9 rounded" />
                  </div>
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
