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
  recentBookings?: OwnerDashboardRecentBooking[]
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

export interface OwnerDashboardRecentBooking {
  booking_id: number | string
  customer_name: string
  vehicle_info: string
  status: string
  start_date?: string
  end_date?: string
  created_at?: string
  dates?: {
    start_date?: string
    end_date?: string
  }
}

export interface OwnerEarningsResponse {
  summary: {
    totalEarnings: number
    pendingAmount: number
    pendingCount: number
    failedCount: number
    totalPayouts: number
  }
  monthlyPoints: EarningsPoint[]
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

  async getEarnings(period: 'month' | 'year' | 'all' = 'month'): Promise<OwnerEarningsResponse> {
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
    const data = body?.data ?? {}

    const baseSummary = {
      totalEarnings: Number(data?.summary?.totalEarnings ?? data?.totalEarnings ?? 0),
      pendingAmount: Number(data?.summary?.pendingAmount ?? data?.pendingAmount ?? 0),
      pendingCount: Number(data?.summary?.pendingCount ?? data?.pendingCount ?? 0),
      failedCount: Number(data?.summary?.failedCount ?? data?.failedCount ?? 0),
      totalPayouts: Number(data?.summary?.totalPayouts ?? data?.totalPayouts ?? 0),
    }

    // Build monthly points from various possible backend shapes
    let monthlyPoints: EarningsPoint[] = []

    if (Array.isArray(data)) {
      monthlyPoints = (data as EarningsPoint[]).map(p => ({
        month: p.month ?? p.period,
        earnings: Number(p.earnings ?? p.revenue ?? 0),
        bookings: Number(p.bookings ?? 0),
      }))
    } else if (Array.isArray(data?.points)) {
      monthlyPoints = (data.points as EarningsPoint[]).map(p => ({
        month: p.month ?? p.period,
        earnings: Number(p.earnings ?? p.revenue ?? 0),
        bookings: Number(p.bookings ?? 0),
      }))
    } else if (Array.isArray(data?.monthlyBreakdown)) {
      const monthNames = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
      ]
      const map = new Map<number, { amount: number; count: number }>()
      for (const m of data.monthlyBreakdown) {
        const idx = typeof m.month === 'number' ? m.month : monthNames.indexOf(String(m.monthName))
        if (idx >= 0) map.set(idx, { amount: Number(m.amount ?? 0), count: Number(m.count ?? 0) })
      }
      monthlyPoints = monthNames.map((name, idx) => {
        const v = map.get(idx)
        return {
          month: name,
          earnings: v ? v.amount : 0,
          bookings: v ? v.count : 0,
        }
      })
    }

    // If totalEarnings missing, derive from monthly points
    const totalFromPoints = monthlyPoints.reduce((s, p) => s + Number(p.earnings ?? 0), 0)
    const summary = {
      ...baseSummary,
      totalEarnings: baseSummary.totalEarnings || totalFromPoints,
    }

    return {
      summary,
      monthlyPoints,
    }
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


