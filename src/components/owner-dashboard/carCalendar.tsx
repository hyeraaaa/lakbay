"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

type CalendarPoint = { day: string; rented: number; available: number }

type Props = {
  data: CalendarPoint[]
  isLoading?: boolean
}

export function UserActivityChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Calendar</CardTitle>
        <CardDescription>Your car&apos;s rental status this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            rented: {
              label: "Rented Days",
              color: "hsl(var(--chart-1))",
            },
            available: {
              label: "Available Days",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="rented" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="available" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
