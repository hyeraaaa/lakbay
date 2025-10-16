"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, Car, XCircle, Calendar } from "lucide-react"

export type StatsCounts = {
  total: number
  pending?: number
  awaiting?: number
  confirmed?: number
  ongoing?: number
  completed?: number
  canceled?: number
}

type StatsCardsProps = {
  counts: StatsCounts
  labels?: Partial<Record<keyof StatsCounts, string>>
}

const statItems = [
  {
    key: "pending" as keyof StatsCounts,
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
  {
    key: "awaiting" as keyof StatsCounts,
    label: "Awaiting",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
  {
    key: "confirmed" as keyof StatsCounts,
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
  {
    key: "ongoing" as keyof StatsCounts,
    label: "Ongoing",
    icon: Car,
    color: "text-purple-600",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
  {
    key: "completed" as keyof StatsCounts,
    label: "Completed",
    icon: TrendingUp,
    color: "text-gray-700",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
  {
    key: "canceled" as keyof StatsCounts,
    label: "Canceled",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-transparent",
    iconColor: "text-black",
  },
]

export const StatsCards: React.FC<StatsCardsProps> = ({ counts, labels }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        const value = counts[item.key]

        if (value === undefined) return null

        const displayLabel = labels?.[item.key] ?? item.label
        return (
          <Card key={item.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{displayLabel}</div>
                </div>
                <Icon className="w-5 h-5 text-black" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default StatsCards
