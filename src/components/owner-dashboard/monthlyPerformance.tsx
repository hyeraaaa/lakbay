"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { EarningsPoint } from "@/services/ownerDashboardService"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  data: EarningsPoint[]
  isLoading?: boolean
}

export function SalesChart({ data, isLoading }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </>
        ) : (
          <>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Number of bookings and earnings per month</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : (
          <ChartContainer
            config={{
              bookings: {
                label: "Bookings",
                color: "hsl(var(--chart-1))",
              },
              earnings: {
                label: "Earnings ($)",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={(d) => (d.month || d.period)} className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={(d) => d.bookings ?? 0} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey={(d) => d.earnings ?? d.revenue ?? 0} fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
