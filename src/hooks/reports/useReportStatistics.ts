import { useState, useCallback, useEffect } from 'react'
import { reportService } from '@/services/reportService'

type Statistics = {
  byStatus: Array<{ status: string; _count: { _all: number } }>
  byPriority: Array<{ priority: string; _count: { _all: number } }>
  last7d: number
}

export function useReportStatistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await reportService.getAdminStatistics()
      if (res.ok && res.data) {
        setStatistics(res.data as Statistics)
      }
    } catch (e) {
      console.error('Failed to fetch statistics:', e)
    }
  }, [])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return { statistics, fetchStatistics }
}

