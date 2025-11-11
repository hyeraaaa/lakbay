"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"

type WeeklyActivityPoint = {
  day: string
  rented: number
  available: number
}

type Props = {
  data: WeeklyActivityPoint[]
  isLoading?: boolean
}

export function SalesChart({ data, isLoading }: Props) {
  const hasData = Array.isArray(data) && data.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-56 mt-2" />
          </>
        ) : (
          <>
            <CardTitle>Weekly Booking Activity</CardTitle>
            <CardDescription>Booked vs available vehicles across the current week</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : hasData ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted) / 0.12" }}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Legend />
                <Bar dataKey="rented" stackId="a" fill="var(--color-primary)" name="Rented" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="var(--color-chart-2)" name="Available" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground px-6 text-center">
            Not enough booking data for the current week yet. New activity will appear here automatically.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
