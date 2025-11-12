import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Calendar, TrendingUp, Star } from "lucide-react"
import type { OwnerDashboardOverview, EarningsPoint } from "@/services/ownerDashboardService"

type Props = {
  overview: OwnerDashboardOverview | null
  isLoading?: boolean
  averageRating?: number | null
  ratingCount?: number
  earnings?: EarningsPoint[]
}

export function StatsCards({ overview, isLoading, averageRating, ratingCount, earnings }: Props) {
  const activeBookings = overview?.summary.activeBookings ?? 0
  const thisMonthEarnings = overview?.summary.thisMonthEarnings ?? 0

  // Calculate total earnings (cumulative sum)
  const earningsSeries = Array.isArray(earnings) 
    ? earnings.filter(p => typeof p?.earnings === 'number')
    : []
  const totalEarnings = earningsSeries.length
    ? earningsSeries.reduce((sum, p) => sum + Number(p.earnings || 0), 0)
    : 0

  const stats = [
    {
      title: "Total Earnings",
      value: `₱${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Rating",
      value: averageRating == null ? "—" : `${averageRating.toFixed(1)} (${ratingCount ?? 0})`,
      icon: Star,
    },
    {
      title: "Active Bookings",
      value: String(activeBookings),
      icon: Calendar,
    },
    {
      title: "Monthly Income",
      value: `₱${thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              )}
              {isLoading ? <Skeleton className="h-4 w-4" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
