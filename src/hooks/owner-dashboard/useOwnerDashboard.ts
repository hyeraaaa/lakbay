"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ownerDashboardService,
  type OwnerDashboardOverview,
  type EarningsPoint,
  type OwnerVehicleWithRating,
  type OwnerEarningsResponse,
} from '@/services/ownerDashboardService'

export interface UseOwnerDashboardReturn {
  overview: OwnerDashboardOverview | null
  earnings: OwnerEarningsResponse | null
  earningsPoints: EarningsPoint[]
  averageRating: number | null
  ratingCount: number
  weeklyCalendar: { day: string; rented: number; available: number }[]
  isLoading: boolean
  error: string
  refresh: () => void
}

export function useOwnerDashboard(): UseOwnerDashboardReturn {
  const [overview, setOverview] = useState<OwnerDashboardOverview | null>(null)
  const [earnings, setEarnings] = useState<OwnerEarningsResponse | null>(null)
  const [earningsPoints, setEarningsPoints] = useState<EarningsPoint[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [weeklyCalendar, setWeeklyCalendar] = useState<{ day: string; rented: number; available: number }[]>([])

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      // Compute current week range (Mon-Sun)
      const now = new Date()
      const day = now.getDay() || 7 // 1..7 (Mon=1)
      const monday = new Date(now)
      monday.setDate(now.getDate() - (day - 1))
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)

      const startStr = monday.toISOString().slice(0, 10)
      const endStr = sunday.toISOString().slice(0, 10)

      const [ov, er, vehicles, bookingsRes] = await Promise.all([
        ownerDashboardService.getOverview(),
        ownerDashboardService.getEarnings('year'),
        ownerDashboardService.getVehicles(),
        ownerDashboardService.getBookings({ start_date: startStr, end_date: endStr, limit: 100 })
      ])
      setOverview(ov)
      setEarnings(er ?? null)
      setEarningsPoints(Array.isArray(er?.monthlyPoints) ? er.monthlyPoints : [])
      // Compute aggregated owner rating across vehicles
      const ratings: { avg: number; count: number }[] = (vehicles as OwnerVehicleWithRating[])
        .map(v => ({ avg: v.rating?.average ?? 0, count: v.rating?.count ?? 0 }))
        .filter(r => r.count > 0)
      if (ratings.length === 0) {
        setAverageRating(null)
        setRatingCount(0)
      } else {
        const totalCount = ratings.reduce((s, r) => s + r.count, 0)
        const weightedSum = ratings.reduce((s, r) => s + r.avg * r.count, 0)
        setAverageRating(Math.round((weightedSum / totalCount) * 10) / 10)
        setRatingCount(totalCount)
      }

      // Derive weekly calendar from bookings overlap
      const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
      const calendar = days.map((d) => ({ day: d, rented: 0, available: 0 }))
      const vehiclesCount = Array.isArray(vehicles) ? vehicles.length : 0
      const bookings = Array.isArray(bookingsRes?.bookings) ? bookingsRes.bookings : []
      // For each day, count rentals where booking overlaps
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const startOfDay = new Date(date)
        startOfDay.setHours(0,0,0,0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23,59,59,999)
        const overlapping = bookings.filter((b: { dates?: { start_date: string; end_date: string }; start_date: string; end_date: string }) => {
          // Adjust to nested date structure if returned under b.dates
          const start = (b.dates?.start_date ?? b.start_date)
          const end = (b.dates?.end_date ?? b.end_date)
          const bs = new Date(start)
          const be = new Date(end)
          return bs <= endOfDay && be >= startOfDay
        })
        const rented = Math.min(vehiclesCount, overlapping.length)
        calendar[i].rented = rented
        calendar[i].available = Math.max(0, vehiclesCount - rented)
      }
      setWeeklyCalendar(calendar)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load dashboard'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refresh = useCallback(() => {
    fetchAll()
  }, [fetchAll])

  return { overview, earnings, earningsPoints, averageRating, ratingCount, weeklyCalendar, isLoading, error, refresh }
}


