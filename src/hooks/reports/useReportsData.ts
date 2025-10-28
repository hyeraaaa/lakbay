import { useState, useCallback } from 'react'
import { reportService } from '@/services/reportService'
import type { Report } from '@/types/report'

type AdminQueueResponse = {
  reports: Report[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useReportsData() {
  const [reports, setReports] = useState<Report[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")

  const fetchReports = useCallback(async (nextPage?: number, onError?: (message: string) => void) => {
    setLoading(true)
    try {
      const targetPage = nextPage ?? page
      const res = await reportService.getAdminQueue({
        page: targetPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        entity_type: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
      })
      
      if (res.ok && res.data) {
        const data = res.data as AdminQueueResponse
        setReports(data.reports)
        setTotalPages(data.totalPages)
        setTotalItems(data.total)
        if (nextPage !== undefined) {
          setPage(targetPage) // Update page state when explicitly set
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch reports'
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, priorityFilter, entityTypeFilter])

  return {
    reports,
    page,
    totalPages,
    totalItems,
    loading,
    statusFilter,
    priorityFilter,
    entityTypeFilter,
    setPage,
    setStatusFilter,
    setPriorityFilter,
    setEntityTypeFilter,
    fetchReports,
  }
}

