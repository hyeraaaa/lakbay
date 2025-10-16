"use client"
import type React from "react"
import Image from "next/image"
import { Star, Users, Fuel, Settings } from "lucide-react"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"

interface ProfileCarCardProps {
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
  coding?: string
}

const ProfileCarCard: React.FC<ProfileCarCardProps> = ({
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
    <div className="bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 overflow-hidden group border border-neutral-300">
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
          <div className="flex items-center justify-start mb-3">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 border-blue-200">
              {codingLabel}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-800">{rating}</span>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCarCard
