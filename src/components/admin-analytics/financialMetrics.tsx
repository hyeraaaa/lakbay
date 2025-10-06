import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react"
import type { FinancialAnalytics } from "@/services/adminAnalyticsService"

interface FinancialMetricsProps {
  data: FinancialAnalytics | null
}

interface MetricItem {
  title: string
  value: string
  icon: LucideIcon
  description: string
  change?: string
  trend?: "up" | "down"
}

export function FinancialMetrics({ data }: FinancialMetricsProps) {
  if (!data) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const month = Number(data.monthRevenue || 0)
  // prevMonthRevenue not provided by FinancialAnalytics; omit change/trend
  const trendUp: "up" | "down" | undefined = undefined
  const changeLabel: string | undefined = undefined

  const metrics: MetricItem[] = [
    {
      title: "Total Revenue",
      value: formatCurrency(Number(data.totalRevenue) || 0),
      icon: Wallet,
      description: "All time revenue",
    },
    {
      title: "Today Revenue",
      value: formatCurrency(Number(data.todayRevenue) || 0),
      icon: TrendingUp,
      description: "Revenue today",
    },
    {
      title: "Month Revenue",
      value: formatCurrency(Number(data.monthRevenue) || 0),
      icon: Calendar,
      description: "Revenue this month",
      change: changeLabel,
      trend: trendUp ? "up" : "down",
    },
    {
      title: "Admin Fees",
      value: formatCurrency(Number(data.totalAdminFees) || 0),
      icon: Wallet,
      description: "Total fees collected",
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
