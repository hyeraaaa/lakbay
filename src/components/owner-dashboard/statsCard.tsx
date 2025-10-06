import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar, TrendingUp, Star } from "lucide-react"
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

  // Derive trends from last two points in earnings series
  const monthOrder = new Map<string, number>([
    ['January', 0], ['February', 1], ['March', 2], ['April', 3], ['May', 4], ['June', 5],
    ['July', 6], ['August', 7], ['September', 8], ['October', 9], ['November', 10], ['December', 11],
  ])
  const getPointIndex = (p: EarningsPoint): number => {
    if (typeof p.month === 'string' && monthOrder.has(p.month)) return monthOrder.get(p.month) as number
    if (typeof p.period === 'string') {
      // Expect formats like YYYY-MM; fallback to Date parse
      const [y, m] = p.period.split('-').map(Number)
      if (!Number.isNaN(y) && !Number.isNaN(m)) return y * 12 + (m - 1)
      const d = Date.parse(p.period)
      if (!Number.isNaN(d)) return Math.floor(d / (1000 * 60 * 60 * 24 * 30))
    }
    return Number.MIN_SAFE_INTEGER
  }
  const sortedPoints = Array.isArray(earnings) ? [...earnings].sort((a, b) => getPointIndex(a) - getPointIndex(b)) : []
  const earningsSeries = sortedPoints.filter(p => typeof p?.earnings === 'number')
  const bookingsSeries = sortedPoints.filter(p => typeof p?.bookings === 'number')
  // Align total earnings with chart: sum of normalized yearly earnings series
  const totalEarnings = (earningsSeries.length
    ? earningsSeries.reduce((sum, p) => sum + Number(p.earnings || 0), 0)
    : 0)
  const currEarnings = earningsSeries.length > 0 ? (earningsSeries[earningsSeries.length - 1].earnings || 0) : 0
  const prevEarnings = earningsSeries.length > 1 ? (earningsSeries[earningsSeries.length - 2].earnings || 0) : 0
  const earningsTrend = currEarnings >= prevEarnings ? 'up' as const : 'down' as const
  const earningsChangePct = prevEarnings === 0 ? (currEarnings > 0 ? 100 : 0) : ((currEarnings - prevEarnings) / prevEarnings) * 100
  const earningsChangeLabel = `${(isFinite(earningsChangePct) ? earningsChangePct : 0).toFixed(1)}%`

  const currBookings = bookingsSeries.length > 0 ? (bookingsSeries[bookingsSeries.length - 1].bookings || 0) : 0
  const prevBookings = bookingsSeries.length > 1 ? (bookingsSeries[bookingsSeries.length - 2].bookings || 0) : 0
  const bookingsTrend = currBookings >= prevBookings ? 'up' as const : 'down' as const
  const bookingsChangePct = prevBookings === 0 ? (currBookings > 0 ? 100 : 0) : ((currBookings - prevBookings) / prevBookings) * 100
  const bookingsChangeLabel = `${(isFinite(bookingsChangePct) ? bookingsChangePct : 0).toFixed(1)}%`

  const stats = [
    {
      title: "Total Earnings",
      value: `₱${totalEarnings.toLocaleString()}`,
      change: earningsSeries.length ? earningsChangeLabel : "",
      trend: earningsSeries.length ? earningsTrend : ("up" as const),
      icon: DollarSign,
    },
    {
      title: "Rating",
      value: averageRating == null ? "—" : `${averageRating.toFixed(1)} (${ratingCount ?? 0})`,
      change: "",
      trend: "up" as const,
      icon: Star,
    },
    {
      title: "Active Bookings",
      value: String(activeBookings),
      change: bookingsSeries.length ? bookingsChangeLabel : "",
      trend: bookingsSeries.length ? bookingsTrend : ("up" as const),
      icon: Calendar,
    },
    {
      title: "Monthly Income",
      value: `₱${thisMonthEarnings.toLocaleString()}`,
      change: earningsSeries.length ? earningsChangeLabel : "",
      trend: earningsSeries.length ? earningsTrend : ("up" as const),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
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
                <>
                  <Skeleton className="h-7 w-28" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24 ml-2" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <p className="flex items-center text-xs text-muted-foreground mt-1">
                    <TrendIcon className={`mr-1 h-4 w-4 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                    <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                    <span className="ml-1">from last month</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
