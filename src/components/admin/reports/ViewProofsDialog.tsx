import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExternalLink, FileImage, FileVideo, FileText } from 'lucide-react'
import type { Report } from '@/types/report'

type ViewProofsDialogProps = {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getFileIcon = (url: string) => {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return <FileImage className="h-4 w-4" />
  } else if (lowerUrl.match(/\.(mp4|webm|mov|avi)$/)) {
    return <FileVideo className="h-4 w-4" />
  } else {
    return <FileText className="h-4 w-4" />
  }
}

export function ViewProofsDialog({
  report,
  open,
  onOpenChange,
}: ViewProofsDialogProps) {
  const evidenceUrls = report?.evidence_urls || []
  const validUrls = evidenceUrls.filter(url => url && url.trim().length > 0)
  const hasProofs = validUrls.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View Proofs - Report #{report?.report_id}</DialogTitle>
          <DialogDescription>
            Evidence and proof links submitted for this report
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!hasProofs ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground">No proof links provided for this report</p>
            </div>
          ) : (
            <div className="space-y-2">
              {validUrls.map((url, index) => {
                const trimmedUrl = url.trim()
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getFileIcon(trimmedUrl)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={trimmedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {trimmedUrl}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => window.open(trimmedUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

