"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useVehicles, type VehicleFormData } from "@/hooks/cars/useAddCars"
import { useStripeConnectStatus } from "@/hooks/cars/useStripeConnectStatus"
import VehiclesTable from "@/components/cars/vehiclesTable"
import { EmptyCarsState } from "@/components/cars/emptyCarState"
import { AddCarDialog } from "@/components/cars/addCarDialog"
import { Container } from "@/components/container"
import { useNotification } from "@/components/NotificationProvider"
import { Skeleton } from "@/components/ui/skeleton"
export default function CarsPage() {
  const { success, error, info } = useNotification()
  const { vehicles, isLoadingVehicles, isCreating, createVehicle, fetchVehicles } = useVehicles()
  const { needsSetup, isLoading: isStripeLoading } = useStripeConnectStatus()

  // Show notification when Stripe Connect setup is needed
  useEffect(() => {
    if (!isStripeLoading && needsSetup) {
      info("Payment setup required: Please set up your Stripe Connect account in Settings to receive payments before adding vehicles.")
    }
  }, [needsSetup, isStripeLoading, info])

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
  
  return ( 
    <div className="bg-background">
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
        ) : vehicles.length === 0 ? (
          isStripeLoading ? (
            <div className="flex flex-col my-auto items-center justify-center px-4">
              <div className="bg-muted/50 rounded-full p-6 mb-6">
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
          ) : (
            <EmptyCarsState needsStripeSetup={needsSetup} />
          )
        ) : (
          <VehiclesTable vehicles={vehicles} onChange={fetchVehicles} />
        )}

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
