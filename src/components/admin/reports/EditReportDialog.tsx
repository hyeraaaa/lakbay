import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Report } from '@/types/report'

type EditReportDialogProps = {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
  status: string
  priority: string
  adminNotes: string
  resolutionNotes: string
  updating: boolean
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onAdminNotesChange: (value: string) => void
  onResolutionNotesChange: (value: string) => void
  onUpdate: () => void
}

export function EditReportDialog({
  report,
  open,
  onOpenChange,
  status,
  priority,
  adminNotes,
  resolutionNotes,
  updating,
  onStatusChange,
  onPriorityChange,
  onAdminNotesChange,
  onResolutionNotesChange,
  onUpdate,
}: EditReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Report #{report?.report_id}</DialogTitle>
          <DialogDescription>Update the status and notes for this report</DialogDescription>
        </DialogHeader>
        {report && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={onPriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => onAdminNotesChange(e.target.value)}
                placeholder="Internal notes for admins..."
                rows={3}
              />
            </div>

            {(status === 'resolved' || status === 'dismissed') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => onResolutionNotesChange(e.target.value)}
                  placeholder="Notes about how this was resolved..."
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={updating}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={updating}>
            {updating ? 'Updating...' : 'Update Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

