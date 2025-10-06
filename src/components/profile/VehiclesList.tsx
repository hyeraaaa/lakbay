"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/imageUtils'
import { encodeId } from '@/lib/idCodec'
import type { VehicleResponse } from '@/services/vehicleServices'
import { useAuth } from '@/hooks/auth/useAuth'

type Props = {
  vehicles: VehicleResponse[]
  isLoadingVehicles: boolean
  hasMoreVehicles: boolean
  showAllVehicles: boolean
  onViewAll: () => void
}

export default function VehiclesList({ vehicles, isLoadingVehicles, hasMoreVehicles, showAllVehicles, onViewAll }: Props) {
  const { user } = useAuth()
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-3">USER VEHICLES</div>

      {!isLoadingVehicles && vehicles.length === 0 && (
        <div className="text-sm text-muted-foreground">No vehicles yet.</div>
      )}

      {vehicles.length > 0 && (   
        <>
          <Link href={(user?.user_type === "owner"
              ? `/owner/vehicle/vehicle-details/${encodeId(String(vehicles[0].vehicle_id))}`
              : `/user/vehicle/${encodeId(String(vehicles[0].vehicle_id))}`)} className="rounded-xl border border-border overflow-hidden bg-background block">
            <div className="relative h-56 md:h-64">
              <Image src={getImageUrl(vehicles[0].vehicle_images?.[0]?.url) || "/placeholder.svg"} alt="Featured vehicle" fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg text-foreground">{vehicles[0].brand} {vehicles[0].model} {vehicles[0].year}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {vehicles[0].reviews_avg ?? '—'}
                </span>
                {typeof vehicles[0].reviews_count === 'number' && <span>({vehicles[0].reviews_count} trips)</span>}
              </div>
              <span className="mt-3 inline-block text-sm font-medium text-black hover:underline">View details</span>
            </div>
          </Link>

          {vehicles.length > 1 && (
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {vehicles.slice(1).map((v) => (
                <Link key={v.vehicle_id} href={(user?.user_type === "owner"
                  ? `/owner/vehicle/vehicle-details/${encodeId(String(v.vehicle_id))}`
                  : `/user/vehicle/${encodeId(String(v.vehicle_id))}`)} className="rounded-xl border border-border overflow-hidden bg-background block">
                  <div className="relative h-40">
                    <Image src={getImageUrl(v.vehicle_images?.[0]?.url) || "/placeholder.svg"} alt={`${v.brand} ${v.model}`} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-foreground">{v.brand} {v.model} {v.year}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {v.reviews_avg ?? '—'}
                      </span>
                      {typeof v.reviews_count === 'number' && <span>({v.reviews_count} trips)</span>}
                    </div>
                    <span className="mt-3 inline-block text-sm font-medium text-black hover:underline">View details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!showAllVehicles && hasMoreVehicles && (
            <div className="mt-6">
              <Button onClick={onViewAll} className="w-full bg-black text-white hover:bg-gray-800">View all vehicles</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}





