"use client"
import type React from "react"
import Image from "next/image"
import { Heart, Star, Users, Fuel, Settings } from "lucide-react"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"

// using shared normalizer from lib

interface CarCardProps {
  carName: string
  location: string
  hostName: string
  price: number
  rating: number
  reviewCount: number
  year: number
  transmission: string
  fuelType: string
  seats: number
  imageUrl: string
  isFavorite: boolean
  onFavoriteToggle: () => void
  coding?: string
}

const CarCard: React.FC<CarCardProps> = ({
  carName,
  location,
  hostName,
  price,
  rating,
  reviewCount,
  year,
  transmission,
  fuelType,
  seats,
  imageUrl,
  isFavorite,
  onFavoriteToggle,
  coding,
}) => {
  const codingLabel = (() => {
    if (!coding) return ""
    const v = coding.trim()
    if (!v) return ""
    const pretty = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    return `Coding every ${pretty}`
  })()
  return (
    <div className="bg-white rounded-xl border border-border hover:bg-[whitesmoke] transition-all duration-200 overflow-hidden group">
      {/* Large and medium screens: horizontal layout */}
      <div className="hidden sm:flex h-32">
        <div className="w-40 flex-shrink-0 relative">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl || "/placeholder.svg"} alt={carName} fill className="object-cover" unoptimized />
            ) : (
              <div className="text-center">
                <span className="text-xs text-gray-500">No Image</span>
              </div>
            )}
          </div>

          <button
            onClick={onFavoriteToggle}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{carName}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{location}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">₱{price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">per day</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{seats}</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                <span>{normalizeTransmissionLabel(transmission)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-3 h-3" />
                <span>{fuelType}</span>
              </div>
              {codingLabel && (
                <span className="ms-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 border-blue-200">
                  {codingLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Host: <span className="font-medium text-gray-800">{hostName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-800">{rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Small screens only: vertical layout like e-commerce */}
      <div className="sm:hidden">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl || "/placeholder.svg"} alt={carName} fill className="object-cover" unoptimized />
            ) : (
              <div className="text-center">
                <span className="text-sm text-gray-500">No Image</span>
              </div>
            )}
          </div>

          <button
            onClick={onFavoriteToggle}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{carName}</h3>
              <p className="text-sm text-gray-600 mt-1">{location}</p>
            </div>
            <div className="text-right ml-3">
              <div className="font-bold text-gray-900 text-lg">₱{price.toLocaleString()}</div>
              <div className="text-sm text-gray-500">per day</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{seats} seats</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>{normalizeTransmissionLabel(transmission)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="w-4 h-4" />
              <span>{fuelType}</span>
            </div>
          </div>

          {codingLabel && (
            <div className="flex items-center justify-end mb-3">
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 border-blue-200">
                {codingLabel}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Host: <span className="font-medium text-gray-800">{hostName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-800">{rating}</span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCard
