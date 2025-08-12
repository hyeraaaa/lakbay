'use client'
import React from 'react'
import Navbar from '@/app/Landing/landing-page-section/navbar'
import CarCard from './components/CarCard'

// Sample car data for testing scrollability
const sampleCars = [
  {
    id: 1,
    carName: "Toyota Camry 2023",
    location: "Manila, Philippines",
    hostName: "John Smith",
    price: 2500,
    rating: 4.8,
    reviewCount: 24,
    year: 2023,
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    imageUrl: "",
    isFavorite: false
  },
  {
    id: 2,
    carName: "Honda Civic 2022",
    location: "Quezon City, Philippines",
    hostName: "Maria Santos",
    price: 2200,
    rating: 4.6,
    reviewCount: 18,
    year: 2022,
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    imageUrl: "",
    isFavorite: true
  },
  {
    id: 3,
    carName: "Ford Ranger 2023",
    location: "Makati, Philippines",
    hostName: "Carlos Reyes",
    price: 3500,
    rating: 4.9,
    reviewCount: 32,
    year: 2023,
    transmission: "Manual",
    fuelType: "Diesel",
    seats: 5,
    imageUrl: "",
    isFavorite: false
  },
  {
    id: 4,
    carName: "Mitsubishi Mirage 2021",
    location: "Pasig, Philippines",
    hostName: "Ana Cruz",
    price: 1800,
    rating: 4.4,
    reviewCount: 15,
    year: 2021,
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    imageUrl: "",
    isFavorite: false
  },
  {
    id: 5,
    carName: "Nissan Navara 2023",
    location: "Taguig, Philippines",
    hostName: "Roberto Garcia",
    price: 4000,
    rating: 4.7,
    reviewCount: 28,
    year: 2023,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 5,
    imageUrl: "",
    isFavorite: true
  }
];

const page = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left side - Car Card */}
        <div className="w-[45%] overflow-y-auto p-4 space-y-4">
          {sampleCars.map((car) => (
            <CarCard
              key={car.id}
              carName={car.carName}
              location={car.location}
              hostName={car.hostName}
              price={car.price}
              rating={car.rating}
              reviewCount={car.reviewCount}
              year={car.year}
              transmission={car.transmission}
              fuelType={car.fuelType}
              seats={car.seats}
              imageUrl={car.imageUrl}
              isFavorite={car.isFavorite}
              onFavoriteToggle={() => console.log(`Toggle favorite for ${car.carName}`)}
            />
          ))}
        </div>
        
        {/* Right side - Map */}
        <div className="w-[55%] overflow-hidden">
          <div className="bg-gray-100 rounded-lg p-4 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-700">Map View</h3>
              <p className="text-gray-500">Interactive map will be displayed here</p>
              <p className="text-sm text-gray-400 mt-2">Location: Manila, Philippines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page;
