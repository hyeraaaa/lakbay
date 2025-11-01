import { useState, useCallback, useEffect } from 'react'
import { reportService } from '@/services/reportService'

type Statistics = {
  byStatus: Array<{ status: string; _count: { _all: number } }>
  byPriority: Array<{ priority: string; _count: { _all: number } }>
  last7d: number
}

type Filters = {
  status?: string
  priority?: string
  entity_type?: string
}

export function useReportStatistics(filters?: Filters) {
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      const filterParams: Filters = {}
      if (filters?.status && filters.status !== 'all') filterParams.status = filters.status
      if (filters?.priority && filters.priority !== 'all') filterParams.priority = filters.priority
      if (filters?.entity_type && filters.entity_type !== 'all') filterParams.entity_type = filters.entity_type
      
      const res = await reportService.getAdminStatistics(filterParams)
      if (res.ok && res.data) {
        setStatistics(res.data as Statistics)
      }
    } catch (e) {
      console.error('Failed to fetch statistics:', e)
    }
  }, [filters?.status, filters?.priority, filters?.entity_type])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return { statistics, fetchStatistics }
}

