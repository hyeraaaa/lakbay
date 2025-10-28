"use client"

import CarCard from "@/components/browse-vehicle/carCard"
import NoVehiclesAvailable from "@/components/browse-vehicle/NoVehiclesAvailable"
import Link from "next/link"
import { VehicleResponse } from "@/services/vehicleServices"
import { transformVehicleData } from "@/lib/transformVehicleData"

type Props = {
  vehicles: VehicleResponse[]
}

export default function VehicleList({ vehicles }: Props) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <NoVehiclesAvailable />
  }

  return (
    <>
      {vehicles.map((vehicle) => {
        const carData = transformVehicleData(vehicle)
        return (
          <Link key={vehicle.vehicle_id} href={`/user/vehicle/${carData.id}`} className="block">
            <CarCard
              carName={carData.carName}
              location={carData.location}
              hostName={carData.hostName}
              price={carData.price}
              rating={carData.rating}
              reviewCount={carData.reviewCount}
              year={carData.year}
              transmission={carData.transmission}
              fuelType={carData.fuelType}
              carType={carData.carType}
              seats={carData.seats}
              imageUrl={carData.imageUrl}
              isFavorite={carData.isFavorite}
              coding={carData.coding}
              onFavoriteToggle={() => console.log(`Toggle favorite for ${carData.carName}`)}
            />
          </Link>
        )
      })}
    </>
  )
}


