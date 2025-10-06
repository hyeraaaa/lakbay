import { apiRequest } from '@/lib/jwt'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export interface OwnerDashboardOverview {
  summary: {
    totalVehicles: number
    activeBookings: number
    totalBookings: number
    thisMonthBookings: number
    thisYearBookings: number
    totalEarnings: number
    thisMonthEarnings: number
    totalPayouts?: number
  }
  vehicleStatus?: {
    total: number
    available: number
    rented: number
    maintenance: number
    pending_registration: number
  }
  recentBookings?: Record<string, unknown>[]
}

export interface EarningsPoint {
  month?: string
  period?: string
  revenue?: number
  earnings?: number
  bookings?: number
}

export interface OwnerVehicleWithRating {
  vehicle_id: number
  brand: string
  model: string
  plate_number: string
  availability: string
  rating?: {
    average: number
    count: number
  }
}

export const ownerDashboardService = {
  async getOverview(): Promise<OwnerDashboardOverview> {
    const res = await apiRequest(`${API_BASE_URL}/api/owner/dashboard/overview`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || 'Failed to fetch owner overview')
    }
    const body = await res.json()
    return body?.data as OwnerDashboardOverview
  },

  async getEarnings(period: 'month' | 'year' | 'all' = 'month'): Promise<EarningsPoint[]> {
    const url = new URL(`${API_BASE_URL}/api/owner/dashboard/earnings`)
    url.searchParams.set('period', period)
    const res = await apiRequest(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || 'Failed to fetch earnings')
    }
    const body = await res.json()
    // Normalize various backend shapes to a consistent points array
    if (Array.isArray(body?.data)) {
      return body.data as EarningsPoint[]
    }
    const data = body?.data
    // Backend currently returns an object with monthlyBreakdown [{ monthName, amount, count }]
    if (data?.monthlyBreakdown && Array.isArray(data.monthlyBreakdown)) {
      // Densify to all 12 months of the current year with zeros for missing months
      const monthNames = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
      ]
      const map = new Map<number, { amount: number; count: number; name: string }>()
      for (const m of data.monthlyBreakdown) {
        const idx = typeof m.month === 'number' ? m.month : monthNames.indexOf(String(m.monthName))
        if (idx >= 0) map.set(idx, { amount: Number(m.amount ?? 0), count: Number(m.count ?? 0), name: monthNames[idx] })
      }
      const points: EarningsPoint[] = monthNames.map((name, idx) => {
        const v = map.get(idx)
        return {
          month: name,
          earnings: v ? v.amount : 0,
          bookings: v ? v.count : 0,
        }
      })
      return points
    }
    // Fallback to known key `points` if provided
    if (Array.isArray(data?.points)) {
      return data.points as EarningsPoint[]
    }
    return []
  },

  async getVehicles(): Promise<OwnerVehicleWithRating[]> {
    const res = await apiRequest(`${API_BASE_URL}/api/owner/dashboard/vehicles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || 'Failed to fetch owner vehicles')
    }
    const body = await res.json()
    const list = Array.isArray(body?.data) ? body.data : []
    return list as OwnerVehicleWithRating[]
  },

  async getBookings(params: { page?: number; limit?: number; status?: string; start_date?: string; end_date?: string } = {}) {
    const url = new URL(`${API_BASE_URL}/api/owner/dashboard/bookings`)
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, String(v))
    })
    const res = await apiRequest(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || 'Failed to fetch owner bookings')
    }
    const body = await res.json()
    return body?.data
  },
}


