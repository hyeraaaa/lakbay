"use client"

import type { VehicleResponse } from "@/services/vehicleServices"
import Image from "next/image"
import { MoreVertical, FileText, Calendar, Car } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DocumentUploadDialog } from "./documentUploadDialog"

interface CarCardProps {
  vehicle: VehicleResponse
  onAlert?: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void
}

const formatAvailability = (availability: string) => {
  return availability.replace(/_/g, " ")
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export function CarCard({ vehicle, onAlert }: CarCardProps) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden group w-full max-w-sm">
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100">
        <Image
          src={`${API_BASE_URL}${vehicle.vehicle_images?.[0]?.url || ""}`}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 ${
              vehicle.availability === "available"
                ? "bg-emerald-500/90 text-white shadow-emerald-500/25"
                : "bg-amber-500/90 text-white shadow-amber-500/25"
            } shadow-lg`}
          >
            {formatAvailability(vehicle.availability)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-200 shadow-lg border border-white/20">
                <MoreVertical className="h-4 w-4 text-gray-700" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <Car className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {(vehicle.availability === "on_hold" || vehicle.availability === "pending_registration") && (
                <DocumentUploadDialog vehicleId={vehicle.vehicle_id} onAlert={onAlert}>
                  <DropdownMenuItem className="gap-2" onSelect={(e) => e.preventDefault()}>
                    <FileText className="h-4 w-4" />
                    Submit Documents
                  </DropdownMenuItem>
                </DocumentUploadDialog>
              )}
              <DropdownMenuItem className="text-red-600 gap-2">
                <FileText className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{vehicle.type}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-foreground">₱{vehicle.rate_per_day}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-sm">per day</span>
          </div>
        </div>
      </div>
    </div>
  )
}
