"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingMetrics } from "@/components/admin-analytics/bookingMetrics"
import { BookingCharts } from "@/components/admin-analytics/bookingCharts"
import { FinancialMetrics } from "@/components/admin-analytics/financialMetrics"
import { FinancialCharts } from "@/components/admin-analytics/financialCharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useJWT } from "@/contexts/JWTContext"
import adminAnalyticsService, { BookingAnalytics, FinancialAnalytics } from "@/services/adminAnalyticsService"

export function AnalyticsDashboard() {
  const [bookingData, setBookingData] = useState<BookingAnalytics | null>(null)
  const [financialData, setFinancialData] = useState<FinancialAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [bookings, financial] = await Promise.all([
          adminAnalyticsService.getBookingAnalytics(),
          adminAnalyticsService.getFinancialAnalytics(),
        ])
        setBookingData(bookings)
        setFinancialData(financial)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setError(error instanceof Error ? error.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* Greeting */}
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Tabs header */}
        <div className="space-y-6">
          <div className="grid w-full max-w-md grid-cols-2 gap-2">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>

          {/* Bookings tab content skeletons */}
          <div className="space-y-6">
            {/* BookingMetrics layout: 4 metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* BookingCharts layout: 4 chart cards in 2 columns, each with 360px chart area */}
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[360px] w-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Financial tab content skeletons */}
          <div className="space-y-6">
            {/* FinancialMetrics layout: 4 metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-28 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FinancialCharts layout */}
            <div className="grid gap-6">
              {/* Revenue by Owner big chart */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="h-[420px] w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Three small summary cards */}
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-balance">{greeting} {firstName}</h1>
        <p className="text-muted-foreground text-pretty">Oversee bookings and revenue</p>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <BookingMetrics data={bookingData} />
          <BookingCharts data={bookingData} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialMetrics data={financialData} />
          <FinancialCharts data={financialData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
