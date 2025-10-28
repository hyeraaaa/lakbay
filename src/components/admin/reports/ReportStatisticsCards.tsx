import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Statistics = {
  byStatus: Array<{ status: string; _count: { _all: number } }>
  byPriority: Array<{ priority: string; _count: { _all: number } }>
  last7d: number
}

type ReportStatisticsCardsProps = {
  statistics: Statistics | null
}

export function ReportStatisticsCards({ statistics }: ReportStatisticsCardsProps) {
  if (!statistics) return null

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Reports (7d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.last7d}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.byStatus.find(s => s.status === 'pending')?._count._all || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Under Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.byStatus.find(s => s.status === 'under_review')?._count._all || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.byPriority.find(p => p.priority === 'urgent')?._count._all || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

