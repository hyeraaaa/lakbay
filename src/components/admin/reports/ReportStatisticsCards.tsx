import { AdminStatsCard, type StatItem } from '@/components/admin/AdminStatsCard'
import { FileText, Clock, Eye, AlertTriangle } from 'lucide-react'

type Statistics = {
  byStatus: Array<{ status: string; _count: { _all: number } }>
  byPriority: Array<{ priority: string; _count: { _all: number } }>
  last7d: number
}

type ReportStatisticsCardsProps = {
  statistics: Statistics | null
  loading?: boolean
}

export function ReportStatisticsCards({ statistics, loading = false }: ReportStatisticsCardsProps) {
  if (!statistics && !loading) return null

  const stats: StatItem[] = statistics ? [
    { 
      label: "New Reports", 
      value: statistics.last7d, 
      icon: FileText 
    },
    { 
      label: "Pending", 
      value: statistics.byStatus.find(s => s.status === 'pending')?._count._all || 0, 
      icon: Clock 
    },
    { 
      label: "Under Review", 
      value: statistics.byStatus.find(s => s.status === 'under_review')?._count._all || 0, 
      icon: Eye 
    },
    { 
      label: "Urgent Priority", 
      value: statistics.byPriority.find(p => p.priority === 'urgent')?._count._all || 0, 
      icon: AlertTriangle 
    },
  ] : []

  return <AdminStatsCard stats={stats} loading={loading} />
}

