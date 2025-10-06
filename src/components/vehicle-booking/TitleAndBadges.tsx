"use client"

import { Badge } from "@/components/ui/badge"
import { Fuel, Settings, Star, Users, Calendar } from "lucide-react"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"

type TitleAndBadgesProps = {
  title: string
  seats?: number | null
  fuelType?: string | null
  transmission?: string | null
  rating?: number | null
  tripCount?: number | null
  coding?: string | null
}

// using shared normalizer from lib

export default function TitleAndBadges({ title, seats, fuelType, transmission, rating, tripCount, coding }: TitleAndBadgesProps) {
  const codingLabel = (() => {
    const v = (coding || "").trim()
    if (!v || v.toUpperCase() === "NONE") return ""
    const pretty = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    return `Coding every ${pretty}`
  })()
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{typeof rating === 'number' ? rating.toFixed(1) : '—'}</span>
          <span className="text-gray-600">({tripCount ?? 0} trips)</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-50 border-gray-200">
          <Users className="h-3 w-3" />
          {seats ?? "-"} seats
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-50 border-gray-200">
          <Fuel className="h-3 w-3" />
          {fuelType || "Gas (Regular)"}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-50 border-gray-200">
          <Settings className="h-3 w-3" />
          {normalizeTransmissionLabel(transmission)}
        </Badge>
        {codingLabel && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">{codingLabel}</span>
          </Badge>
        )}
      </div>
    </div>
  )
}


