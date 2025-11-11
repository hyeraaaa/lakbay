"use client"

import { StatsCards } from "@/components/owner-dashboard/statsCard"
import { RevenueChart } from "@/components/owner-dashboard/revenueChart"
import { SalesChart } from "@/components/owner-dashboard/monthlyPerformance"
import { useOwnerDashboard } from "@/hooks/owner-dashboard/useOwnerDashboard"
import { useJWT } from "@/contexts/JWTContext"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo } from "react"

export default function Page() {
  const { overview, earningsPoints, weeklyCalendar, averageRating, ratingCount, isLoading } = useOwnerDashboard()
  const { user } = useJWT()

  const greeting = useMemo(() => {
    const hour = Number(
      new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Manila",
      }).format(new Date())
    )
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }, [])
  const firstName = user?.first_name || user?.email?.split("@")[0] || "there"
  return (
    <div>
      <main className="container mx-auto space-y-6">
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
        <StatsCards
          overview={overview}
          isLoading={isLoading}
          averageRating={averageRating}
          ratingCount={ratingCount}
          earnings={earningsPoints}
        />
        <div className="grid gap-6 md:grid-cols-2 items-stretch content-stretch">
          <div className="flex flex-col h-full min-w-0">
            <RevenueChart data={earningsPoints} isLoading={isLoading} />
          </div>
          <div className="flex flex-col h-full min-w-0">
            <SalesChart data={weeklyCalendar} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}