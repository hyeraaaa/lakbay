"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { EarningsPoint } from "@/services/ownerDashboardService"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  data: EarningsPoint[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: Props) {
  // Ensure chronological order by month name if present
  const monthOrder = new Map<string, number>([
    ["January", 0], ["February", 1], ["March", 2], ["April", 3], ["May", 4], ["June", 5],
    ["July", 6], ["August", 7], ["September", 8], ["October", 9], ["November", 10], ["December", 11],
  ])
  const sorted = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const ai = a.month && monthOrder.has(a.month) ? (monthOrder.get(a.month) ?? 0) : 0
        const bi = b.month && monthOrder.has(b.month) ? (monthOrder.get(b.month) ?? 0) : 0
        return ai - bi
      })
    : []
  return (
    <Card className="w-full">
      <CardHeader>
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </>
        ) : (
          <>
            <CardTitle>My Earnings</CardTitle>
            <CardDescription>Monthly income from your car rentals</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : (
          <ChartContainer
            config={{
              earnings: {
                label: "Earnings",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sorted}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-chart-1)"
                  fill="url(#colorEarnings)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
