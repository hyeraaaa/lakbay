"use client"
import Link from 'next/link'
import { getImageUrl } from '@/lib/imageUtils'
import { encodeId } from '@/lib/idCodec'
import type { VehicleResponse } from '@/services/vehicleServices'
import { useAuth } from '@/hooks/auth/useAuth'
import ProfileCarCard from '@/components/profile/ProfileCarCard'

type Props = {
  vehicles: VehicleResponse[]
  isLoadingVehicles: boolean
}

export default function VehiclesList({ vehicles, isLoadingVehicles }: Props) {
  const { user } = useAuth()
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-3">USER VEHICLES</div>

      {!isLoadingVehicles && vehicles.length === 0 && (
        <div className="text-sm text-muted-foreground">No vehicles yet.</div>
      )}

      {vehicles.length > 0 && (   
        <>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
            {vehicles.map((v) => (
              <Link key={v.vehicle_id} href={(user?.user_type === "owner"
                ? `/owner/vehicle/vehicle-details/${encodeId(String(v.vehicle_id))}`
                : `/user/vehicle/${encodeId(String(v.vehicle_id))}`)}>
                <ProfileCarCard
                  carName={`${v.brand} ${v.model} ${v.year}`}
                  location={v.garage_location_name || 'Location not specified'}
                  hostName={`${v.users?.first_name || ''} ${v.users?.last_name || ''}`.trim() || 'Unknown Host'}
                  price={v.rate_per_day}
                  rating={v.reviews_avg || 0}
                  reviewCount={v.reviews_count || 0}
                  year={v.year}
                  transmission={v.transmission || 'Unknown'}
                  fuelType={v.fuel_type || 'Unknown'}
                  seats={v.seats}
                  imageUrl={getImageUrl(v.vehicle_images?.[0]?.url) || "/placeholder.svg"}
                  coding={v.coding}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}





