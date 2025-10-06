"use client"

import { Badge } from "@/components/ui/badge"

interface DocumentTypeBadgeProps {
  docType: string
}

export default function DocumentTypeBadge({ docType }: DocumentTypeBadgeProps) {
  switch (docType) {
    case "driver_license":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Driver License
        </Badge>
      )
    case "passport":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Passport
        </Badge>
      )
    case "id_card":
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          National ID
        </Badge>
      )
    case "business_license":
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          Business License
        </Badge>
      )
    case "vehicle_registration":
      return (
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
          Vehicle Registration
        </Badge>
      )
    default:
      return null
  }
}
