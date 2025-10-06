"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { FinancialAnalytics } from "@/services/adminAnalyticsService"

interface RevenueByOwnerItem {
  owner_id: string | number
  owner_name?: string
  revenue: number | string
}

interface FinancialChartsProps {
  data: FinancialAnalytics | null
}

interface RevenueDataItem {
  name: string
  revenue: number
}

export function FinancialCharts({ data }: FinancialChartsProps) {
  if (!data) return null

  // Transform revenue by owner data
  const revenueData: RevenueDataItem[] = (
    Array.isArray(data.revenueByOwnerDetailed) && data.revenueByOwnerDetailed.length > 0
      ? data.revenueByOwnerDetailed.map((item: RevenueByOwnerItem) => ({
          name: item.owner_name || `Owner ${item.owner_id}`,
          revenue: Number(item.revenue ?? 0),
        }))
      : Object.entries(data.revenueByOwner || {}).map(([ownerId, revenue]) => ({
          name: `Owner ${ownerId}`,
          revenue: Number(revenue),
        }))
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Owner</CardTitle>
          <CardDescription>Top 10 owners by total revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "var(--chart-1)",
              },
            }}
            className="h-[420px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical">
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number | string) => formatCurrency(Number(value))}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(Number(data.totalRevenue) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Admin Fees</span>
              <span className="font-semibold">{formatCurrency(Number(data.totalAdminFees) || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Net to Owners</span>
              <span className="font-bold">
                {formatCurrency(Number(data.totalRevenue) - Number(data.totalAdminFees) || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatCurrency(Number(data.todayRevenue) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">vs. Total</span>
              <span className="font-semibold">
                {Number(data.totalRevenue) > 0
                  ? `${((Number(data.todayRevenue) / Number(data.totalRevenue)) * 100).toFixed(2)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatCurrency(Number(data.monthRevenue) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">vs. Total</span>
              <span className="font-semibold">
                {Number(data.totalRevenue) > 0
                  ? `${((Number(data.monthRevenue) / Number(data.totalRevenue)) * 100).toFixed(2)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
