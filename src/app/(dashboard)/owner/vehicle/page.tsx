"use client"

import { useState, useEffect, useMemo } from "react"
import { Car, CheckCircle, XCircle, ShieldCheck, Search } from "lucide-react"
import { useVehicles, type VehicleFormData, type VehicleServerFilters } from "@/hooks/cars/useAddCars"
import { useStripeConnectStatus } from "@/hooks/cars/useStripeConnectStatus"
import VehiclesTable from "@/components/cars/vehiclesTable"
import { EmptyCarsState } from "@/components/cars/emptyCarState"
import { AddCarDialog } from "@/components/cars/addCarDialog"
import { useNotification } from "@/components/NotificationProvider"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
export default function CarsPage() {
  const { success, error, info } = useNotification()
  const { vehicles, allVehicles, isLoadingVehicles, isLoadingAllVehicles, isCreating, createVehicle, fetchVehicles, filters, setFilters } = useVehicles()
  const { needsSetup, isLoading: isStripeLoading } = useStripeConnectStatus()
  const [filterValue, setFilterValue] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Show notification when Stripe Connect setup is needed
  useEffect(() => {
    if (!isStripeLoading && needsSetup) {
      info("Payment setup required: Please set up your Stripe Connect account in Settings to receive payments before adding vehicles.")
    }
  }, [needsSetup, isStripeLoading, info])

  // Update filter based on dropdown selection
  const handleFilterChange = (value: string) => {
    setFilterValue(value)
    if (value === 'all') {
      setFilters({})
    } else if (value === 'available') {
      setFilters({ availability: 'available' })
    } else if (value === 'unavailable') {
      setFilters({ availability: 'unavailable' })
    } else if (value === 'registered') {
      setFilters({ is_registered: true })
    }
  }

  const handleCreateVehicle = async (formData: VehicleFormData) => {
    await createVehicle(formData)
  }

  const handleAlert = (message: string, variant: "default" | "destructive" | "success" | "warning" | "info" = "default") => {
    switch (variant) {
      case "success":
        success(message)
        break
      case "destructive":
        error(message)
        break
      case "info":
      case "warning":
      default:
        info(message)
        break
    }
  }
  
  const isFiltered = useMemo(() => {
    return Boolean(filters?.availability) || typeof filters?.is_registered === 'boolean'
  }, [filters])

  // Filter vehicles based on search query
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) {
      return vehicles
    }
    
    const query = searchQuery.toLowerCase().trim()
    return vehicles.filter(vehicle => {
      const brand = vehicle.brand?.toLowerCase() || ''
      const model = vehicle.model?.toLowerCase() || ''
      const plateNumber = vehicle.plate_number?.toLowerCase() || ''
      const type = vehicle.type?.toLowerCase() || ''
      const description = vehicle.description?.toLowerCase() || ''
      
      return brand.includes(query) || 
             model.includes(query) || 
             plateNumber.includes(query) || 
             type.includes(query) || 
             description.includes(query)
    })
  }, [vehicles, searchQuery])

  return ( 
    <div>
      <h3 className="text-3xl font-bold tracking-tight text-balance">Vehicles</h3>
      <p className="text-muted-foreground text-pretty mb-2">Easily manage and track all your registered vehicles in one place.</p>
      {
        // Stats cards
      }
      <VehiclesStats 
        vehiclesCount={allVehicles.length} 
        vehicles={allVehicles} 
        isLoading={isLoadingAllVehicles}
      />


       <Card>
         <CardContent>
             {/* Search and Filter */}
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
               
               <Select value={filterValue} onValueChange={handleFilterChange}>
                 <SelectTrigger className="bg-white border-neutral-300">
                   <SelectValue placeholder="All Vehicles" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Vehicles</SelectItem>
                   <SelectItem value="available">Available</SelectItem>
                   <SelectItem value="unavailable">Unavailable</SelectItem>
                   <SelectItem value="registered">Registered</SelectItem>
                 </SelectContent>
               </Select>
             </div>
            
              {/* Cars Display */}
              {isLoadingVehicles ? (
                <div className="space-y-4">
                  <div className="bg-background rounded-md border">
                    <div className="overflow-x-auto">
                      <div className="min-w-[720px] p-4">
                      {/* Table header skeleton */}
                      <div className="grid grid-cols-7 gap-4 px-2 py-2">
                        <Skeleton className="h-5 w-7" />
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20 hidden sm:block" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      {/* Rows skeleton */}
                      <div className="space-y-3 mt-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={idx} className="grid grid-cols-7 gap-4 items-center px-2 py-3 border-t">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20 hidden sm:block" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <div className="flex justify-start">
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                      </div>
                    </div>
                  </div>
                  {/* Footer pagination skeleton */}
                  <div className="flex items-center justify-between gap-8">
                    <div />
                    <div className="flex grow justify-end">
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9 rounded" />
                      <Skeleton className="h-9 w-9 rounded" />
                      <Skeleton className="h-9 w-9 rounded" />
                      <Skeleton className="h-9 w-9 rounded" />
                    </div>
                  </div>
                </div>
              ) : filteredVehicles.length === 0 ? (
                isStripeLoading ? (
                  <div className="flex flex-col my-auto items-center justify-center px-4">
                    <div className="bg-muted/50 rounded-full p-6 mb-6">
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                ) : (
                  (isFiltered || searchQuery.trim()) ? (
                    <div className="bg-background rounded-md border p-8 text-center text-sm text-muted-foreground">No vehicles match the selected filter or search query.</div>
                  ) : (
                    <EmptyCarsState needsStripeSetup={needsSetup} />
                  )
                )
              ) : (
                <VehiclesTable vehicles={filteredVehicles} onChange={fetchVehicles} />
              )}
        </CardContent>
        </Card>
      

        {/* Add Car Dialog */}
        <AddCarDialog 
          onSubmit={handleCreateVehicle} 
          isLoading={isCreating} 
          onAlert={handleAlert}
          hideTrigger={!isStripeLoading && needsSetup}
        />
      </div>
  )
}

type VehiclesStatsProps = {
  vehiclesCount: number
  vehicles: ReturnType<typeof useVehicles>["vehicles"]
  isLoading: boolean
}

function VehiclesStats({ vehiclesCount, vehicles, isLoading }: VehiclesStatsProps) {
  const counts = useMemo(() => {
    const total = vehiclesCount
    const available = vehicles.filter(v => (v.availability || "").toLowerCase() === "available").length
    const unavailable = Math.max(0, total - available)
    const registered = vehicles.filter(v => !!v.is_registered).length
    return { total, available, unavailable, registered }
  }, [vehiclesCount, vehicles])

  const items = [
    { key: "total", label: "Total", value: counts.total, Icon: Car },
    { key: "available", label: "Available", value: counts.available, Icon: CheckCircle },
    { key: "unavailable", label: "Unavailable", value: counts.unavailable, Icon: XCircle },
    { key: "registered", label: "Registered", value: counts.registered, Icon: ShieldCheck },
  ] as const
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {items.map(({ key, label, value, Icon }) => {
        return (
          <Card key={key}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-7 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                  </div>
                  <Icon className="w-5 h-5 text-black" />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
