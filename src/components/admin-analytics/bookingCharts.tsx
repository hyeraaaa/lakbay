"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { BookingAnalytics } from "@/services/adminAnalyticsService"

interface StatusItem {
  status: string
  _count: { status: number }
}

interface VehicleItem {
  vehicle_id: number
  vehicle_name?: string
  brand?: string
  model?: string
  _count: { vehicle_id: number }
}

interface CustomerItem {
  user_id: number
  customer_name?: string
  first_name?: string
  last_name?: string
  _count: { user_id: number }
}

interface OwnerItem {
  owner_id: number
  owner_name?: string
  first_name?: string
  last_name?: string
  count: number
}

interface BookingChartsProps {
  data: BookingAnalytics | null
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const formatValue = (value: string | null | undefined) => {
  if (!value) return '-'
  return value.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatVehicleName = (name: string) => {
  if (!name) return name
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

export function BookingCharts({ data }: BookingChartsProps) {
  if (!data) return null

  // Transform status data for pie chart
  const statusData =
    data.byStatus?.map((item: StatusItem) => ({
      name: formatValue(item.status),
      value: item._count.status,
    })) || []

  // Transform vehicle data for bar chart
  const vehicleData =
    data.mostBookedVehicles?.map((item: VehicleItem) => {
      const rawName = item.vehicle_name || (item.brand && item.model ? `${item.brand} ${item.model}` : `Vehicle ${item.vehicle_id}`)
      return {
        name: formatVehicleName(rawName),
        bookings: item._count.vehicle_id,
      }
    }) || []

  // Transform customer data for bar chart
  const customerData =
    data.bookingsPerCustomer?.map((item: CustomerItem) => ({
      name: item.customer_name || (item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : `Customer ${item.user_id}`),
      bookings: item._count.user_id,
    })) || []

  // Transform owner data for bar chart
  const ownerData =
    data.topOwners?.map((item: OwnerItem) => ({
      name: item.owner_name || (item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : `Owner ${item.owner_id}`),
      bookings: item.count,
    })) || []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Status</CardTitle>
          <CardDescription>Distribution of booking statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Bookings",
                color: "var(--chart-1)",
              },
            }}
            className="h-[360px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="var(--color-value)"
                  dataKey="value"
                >
                  {statusData.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Booked Vehicles</CardTitle>
          <CardDescription>Top 5 vehicles by booking count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bookings: {
                label: "Bookings",
                color: "var(--chart-2)",
              },
            }}
            className="h-[360px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Top 5 customers by booking count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bookings: {
                label: "Bookings",
                color: "var(--chart-3)",
              },
            }}
            className="h-[360px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Owners</CardTitle>
          <CardDescription>Top 5 owners by total bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bookings: {
                label: "Bookings",
                color: "var(--chart-4)",
              },
            }}
            className="h-[360px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ownerData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
