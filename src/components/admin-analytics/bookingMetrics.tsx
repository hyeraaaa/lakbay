import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Users, ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react"
import type { BookingAnalytics } from "@/services/adminAnalyticsService"

interface BookingMetricsProps {
  data: BookingAnalytics | null
}

interface MetricItem {
  title: string
  value: string
  icon: LucideIcon
  description: string
  change?: string
  trend?: "up" | "down"
}

export function BookingMetrics({ data }: BookingMetricsProps) {
  if (!data) return null

  const thisMonth = Number(data.thisMonth || 0)
  // Previous month value is not available in BookingAnalytics; omit change when unknown
  const monthTrendUp: "up" | "down" | undefined = undefined
  const monthChangeLabel: string | undefined = undefined

  const metrics: MetricItem[] = [
    {
      title: "Total Bookings",
      value: (data.total ?? 0).toLocaleString(),
      icon: Calendar,
      description: "All time bookings",
    },
    {
      title: "Today",
      value: (data.today ?? 0).toLocaleString(),
      icon: TrendingUp,
      description: "Bookings today",
    },
    {
      title: "This Month",
      value: (data.thisMonth ?? 0).toLocaleString(),
      icon: Calendar,
      description: "Bookings this month",
      change: monthChangeLabel,
      trend: monthTrendUp,
    },
    {
      title: "Active Customers",
      value: (data.bookingsPerCustomer?.length ?? 0).toString(),
      icon: Users,
      description: "Customers with bookings",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "down" ? ArrowDownRight : ArrowUpRight
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
              {metric.change && (
                <p className="flex items-center text-xs mt-1">
                  <TrendIcon className={`mr-1 h-4 w-4 ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                  <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                  <span className="ml-1 text-muted-foreground">from last month</span>
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
