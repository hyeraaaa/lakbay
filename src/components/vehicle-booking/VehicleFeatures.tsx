"use client"

import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

type VehicleFeaturesProps = {
  description?: string | null
  features?: string[] | null
}

export default function VehicleFeatures({ description, features }: VehicleFeaturesProps) {
  const normalizeFeatureLabel = (rawFeature: string): string => {
    const cleaned = String(rawFeature ?? "")
      .replace(/[_-]+/g, " ")
      .trim()
    if (!cleaned) return ""

    const acronyms = new Set(["USB", "GPS", "ABS", "AC", "AUX", "AWD", "4X4"]) 

    const words = cleaned.split(/\s+/).map((word) => {
      const upper = word.toUpperCase()
      if (acronyms.has(upper)) {
        if (upper === "4X4") return "4x4"
        return upper
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })

    return words.join(" ")
  }
  return (
    <>
      {/* Vehicle description */}
      <div className="border-b border-neutral-300 pb-8">
        <h3 className="font-semibold text-lg mb-2">Vehicle description</h3>
        <div className="flex items-start gap-2">
          <p className="text-gray-600 text-sm mb-5">
            {description?.trim() || "No description provided for this vehicle."}
          </p>
        </div>
      </div>

      {/* Vehicle Features */}
      <div className="border-b border-neutral-300 pb-8">
        <h3 className="font-semibold text-lg mb-4">Vehicle features</h3>
        {!features || features.length === 0 ? (
          <p className="text-sm text-gray-600">No listed features.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {features.map((f, idx) => (
              <Badge
                key={`${f}-${idx}`}
                variant="outline"
                className="px-3 py-1 bg-white border-gray-300 text-gray-800"
              >
                {normalizeFeatureLabel(f)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </>
  )
}


