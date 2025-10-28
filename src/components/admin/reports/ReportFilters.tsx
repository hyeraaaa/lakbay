import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomCard, CardContent } from '@/components/ui/card'

type ReportFiltersProps = {
  statusFilter: string
  priorityFilter: string
  entityTypeFilter: string
  loading: boolean
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onEntityTypeChange: (value: string) => void
  onApply: () => void
}

export function ReportFilters({
  statusFilter,
  priorityFilter,
  entityTypeFilter,
  loading,
  onStatusChange,
  onPriorityChange,
  onEntityTypeChange,
  onApply,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="bg-white border-neutral-300">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="bg-white border-neutral-300">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={entityTypeFilter} onValueChange={onEntityTypeChange}>
        <SelectTrigger className="bg-white border-neutral-300">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="vehicle">Vehicle</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

