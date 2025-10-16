"use client"

import React from 'react'
import { StatsCards } from "@/components/owner-dashboard/statsCard"
import { RevenueChart } from "@/components/owner-dashboard/revenueChart"
import { EventCalendar, type CalendarEvent, type EventColor } from "@/components/event-calendar"
import { useCallback, useRef, useState, useMemo } from 'react'
import { ownerDashboardService } from "@/services/ownerDashboardService"
import { SalesChart } from "@/components/owner-dashboard/monthlyPerformance"
import { useOwnerDashboard } from "@/hooks/owner-dashboard/useOwnerDashboard"
import { useJWT } from "@/contexts/JWTContext"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page() {
  const { overview, earnings, averageRating, ratingCount, isLoading } = useOwnerDashboard()
  const [visibleEvents, setVisibleEvents] = useState<CalendarEvent[]>([])
  // Map a consistent color per vehicle for visual grouping
  const vehicleColorMap = useRef<Record<string, EventColor>>({})
  const palette: EventColor[] = useMemo(() => ["sky", "amber", "violet", "rose", "orange"], [])
  const paletteIndex = useRef<number>(0)

  const getStatusColor = (rawStatus: unknown): EventColor | null => {
    const status = String(rawStatus ?? "").toLowerCase()
    if (!status) return null
    if (status.includes("complete")) return "emerald"
    if (status.includes("cancel")) return "rose"
    if (status.includes("declin") || status.includes("reject")) return "rose"
    if (status.includes("pending") || status.includes("await")) return "amber"
    if (status.includes("approve") || status.includes("confirm")) return "sky"
    if (status.includes("ongoing") || status.includes("active") || status.includes("in-progress")) return "violet"
    if (status.includes("refun")) return "orange"
    return null
  }

  const fetchRangeBookings = useCallback(async (start: Date, end: Date) => {
    try {
      const startStr = start.toISOString().slice(0,10)
      const endStr = end.toISOString().slice(0,10)
      const data = await ownerDashboardService.getBookings({ start_date: startStr, end_date: endStr, limit: 200 })
      const bookings = Array.isArray(data?.bookings) ? data.bookings : []
      const events: CalendarEvent[] = bookings.map((b: unknown, idx: number) => {
        const booking = b as Record<string, unknown>
        const id = String(booking.booking_id ?? booking.id ?? idx)
        const startDate = (booking.dates as Record<string, unknown>)?.start_date ?? booking.start_date
        const endDate = (booking.dates as Record<string, unknown>)?.end_date ?? booking.end_date
        const s = new Date(String(startDate || ''))
        const e = new Date(String(endDate || ''))
        const vehicle = booking.vehicle as Record<string, unknown> | undefined
        const vehicleName = (vehicle?.brand && vehicle?.model)
          ? `${vehicle.brand} ${vehicle.model}`
          : (vehicle?.info
            ? vehicle.info as string
            : (vehicle?.plate_number
              ? vehicle.plate_number as string
              : (booking.vehicle_name as string ?? 'Booking')))
        const plateNumber = vehicle?.plate_number as string | undefined
        const vehicleKey = String(
          vehicle?.id ?? vehicle?.vehicle_id ?? booking.vehicle_id ?? vehicle?.plate_number ?? vehicleName
        )
        const statusColor = getStatusColor(booking.status)
        let color: EventColor
        if (statusColor) {
          color = statusColor
        } else {
          if (!vehicleColorMap.current[vehicleKey]) {
            vehicleColorMap.current[vehicleKey] = palette[paletteIndex.current % palette.length]
            paletteIndex.current += 1
          }
          color = vehicleColorMap.current[vehicleKey]
        }
        return {
          id,
          title: plateNumber ? `${vehicleName} • ${plateNumber}` : vehicleName,
          description: booking.status ? `Status: ${booking.status}` : undefined,
          start: s,
          end: e,
          allDay: false,
          color,
          location: (booking.pickup_location ?? booking.location) as string | undefined,
        }
      })
      setVisibleEvents(events)
    } catch (e) {
      // silently ignore
    }
  }, [palette])
  const { user } = useJWT()

  const greeting = (() => {
    const hour = Number(
      new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(new Date())
    )
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  })()
  const firstName = user?.first_name || user?.email?.split('@')[0] || 'there'

  return (
    <div>
      <main className="mx-auto space-y-6">
        <div className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-[280px]" />
              <Skeleton className="h-4 w-[380px]" />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold tracking-tight text-balance">{greeting}, {firstName}</h2>
              <p className="text-muted-foreground text-pretty">Manage vehicles, earnings, and bookings with live insights</p>
            </>
          )}
        </div>
        <StatsCards overview={overview} isLoading={isLoading} averageRating={averageRating} ratingCount={ratingCount} earnings={earnings} />
        <div className="grid gap-6 md:grid-cols-2 items-stretch content-stretch">
          <div className="flex flex-col h-full min-w-0">
            <RevenueChart data={earnings} isLoading={isLoading} />
          </div>
          <div className="flex flex-col h-full min-w-0">
            <SalesChart data={earnings} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
