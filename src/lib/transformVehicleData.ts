import { VehicleResponse } from "@/services/vehicleServices"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"
import { getVehiclePrimaryImageUrl } from "@/lib/imageUtils"
import { encodeId } from "@/lib/idCodec"

export type CarCardData = {
  id: string // Now encrypted ID
  carName: string
  location: string
  hostName: string
  price: number
  rating: number
  reviewCount: number
  year: number
  transmission: string
  fuelType: string
  carType: string
  seats: number
  imageUrl: string
  isFavorite: boolean
  coding?: string
}

export const transformVehicleData = (vehicle: VehicleResponse): CarCardData => {
  const hostName = vehicle.users
    ? `${vehicle.users.first_name} ${vehicle.users.last_name}`
    : "Unknown Host"

  const locationLabel = (() => {
    if (vehicle.garage_location_name && vehicle.garage_location_name.trim()) {
      return vehicle.garage_location_name
    }
    if (
      typeof vehicle.garage_latitude === 'number' && !isNaN(vehicle.garage_latitude) &&
      typeof vehicle.garage_longitude === 'number' && !isNaN(vehicle.garage_longitude)
    ) {
      return `(${vehicle.garage_latitude.toFixed(5)}, ${vehicle.garage_longitude.toFixed(5)})`
    }
    return "Location not available"
  })()

  return {
    id: encodeId(vehicle.vehicle_id.toString()),
    carName: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    location: locationLabel,
    hostName,
    price: vehicle.rate_per_day,
    rating: typeof vehicle.reviews_avg === 'number' && vehicle.reviews_avg > 0 ? Number(vehicle.reviews_avg.toFixed(1)) : 0,
    reviewCount: typeof vehicle.reviews_count === 'number' ? vehicle.reviews_count : 0,
    year: vehicle.year,
    transmission: normalizeTransmissionLabel(vehicle.transmission || "Automatic"),
    fuelType: vehicle.fuel_type || "Gasoline",
    carType: vehicle.type || "Unknown",
    seats: vehicle.seats,
    imageUrl: getVehiclePrimaryImageUrl(vehicle),
    isFavorite: false,
    coding: vehicle.coding,
  }
}


