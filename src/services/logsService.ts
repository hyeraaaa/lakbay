import { apiRequest } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export type LogItem = {
  id: number
  action: string
  activity_title: string | null
  activity_description: string | null
  activity_category: string | null
  timestamp: string
  // Not guaranteed by backend; keep optional for graceful display
  user_id?: number | null
  user_name?: string | null
}

export type LogsResponse = {
  success?: boolean
  data?: {
    logs: LogItem[]
    pagination?: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
  // Some controllers might return directly without success wrapper
  logs?: LogItem[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const logsService = {
  async list(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    startDate?: string
    endDate?: string
    action?: string
    activityCategory?: string
    search?: string
  }): Promise<{ items: LogItem[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }> {
    const qs = new URLSearchParams()
    let basePath = "/api/users/logs"

    if (params) {
      const { search, ...rest } = params
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) {
          qs.append(k, String(v))
        }
      })

      const trimmedSearch = search?.trim()
      if (trimmedSearch) {
        basePath = "/api/users/logs/search"
        qs.append("query", trimmedSearch)
      }
    }

    const url = `${API_BASE_URL}${basePath}${qs.toString() ? `?${qs.toString()}` : ""}`
    const res = await apiRequest(url, { method: "GET" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || "Failed to fetch logs")
    }
    const data: LogsResponse = await res.json().catch(() => ({} as LogsResponse))
    // Normalize shape
    const items = data?.data?.logs ?? data?.logs ?? []
    const pagination = data?.data?.pagination ?? data?.pagination
    return { items, pagination }
  },
}

export default logsService



