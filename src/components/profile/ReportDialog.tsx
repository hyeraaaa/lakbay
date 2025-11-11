"use client"
import { useState, useEffect } from "react"
import { useJWT } from "@/contexts/JWTContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { reportService } from "@/services/reportService"
import { toast } from "sonner"
import { Flag } from "lucide-react"

interface ReportDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const USER_REPORT_CATEGORIES = [
  { value: "impersonation", label: "Impersonation" },
  { value: "obscene_pfp", label: "Inappropriate Profile Picture" },
  { value: "harassment", label: "Harassment" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "fraud", label: "Fraud" },
  { value: "off_platform_solicitation", label: "Off-Platform Solicitation" },
  { value: "spam", label: "Spam" },
  { value: "underage_identity", label: "Underage Identity" },
  { value: "unsafe_conduct", label: "Unsafe Conduct" },
  { value: "privacy_violation", label: "Privacy Violation" },
  { value: "other", label: "Other" },
]

export default function ReportDialog({ userId, userName, open, onOpenChange }: ReportDialogProps) {
  const [category, setCategory] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAlreadyReported, setHasAlreadyReported] = useState(false)
  const [checkingReport, setCheckingReport] = useState(false)
  const [lastReportedAt, setLastReportedAt] = useState<Date | null>(null)
  const [evidenceText, setEvidenceText] = useState<string>("") // optional proof links

  const { user, isAuthenticated } = useJWT()

  // Check if user has already reported this user when dialog opens
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!open || !isAuthenticated || !user) {
        setHasAlreadyReported(false)
        return
      }

      setCheckingReport(true)
      try {
        const result = await reportService.getMyReports({ 
          entity_type: 'user',
          limit: 100 
        })
        
        if (result.ok) {
          const numericUserId = parseInt(userId)
          const now = new Date()
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          
          const existingReport = result.data.reports.find(report => 
            report.reported_entity_id === numericUserId &&
            report.reported_entity_type === 'user' &&
            ['pending', 'under_review'].includes(report.status) &&
            new Date(report.created_at) >= twentyFourHoursAgo
          )
          
          if (existingReport) {
            setHasAlreadyReported(true)
            setLastReportedAt(new Date(existingReport.created_at))
          } else {
            setHasAlreadyReported(false)
            setLastReportedAt(null)
          }
        }
      } catch (error) {
        console.error('Error checking existing report:', error)
        setHasAlreadyReported(false)
      } finally {
        setCheckingReport(false)
      }
    }

    checkExistingReport()
  }, [open, isAuthenticated, user, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }
    
    if (!isAuthenticated) {
      toast.error("You must be logged in to submit a report.")
      return
    }

    if (!category) {
      toast.error("Please select a category")
      return
    }

    if (!description.trim()) {
      toast.error("Please provide a description")
      return
    }

    setIsSubmitting(true)

    try {
      const numericUserId = parseInt(userId)
      if (isNaN(numericUserId)) {
        throw new Error("Invalid user ID")
      }

      // Parse optional evidence URLs (comma or newline separated)
      const evidence_urls = evidenceText
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
        .slice(0, 5)

      const result = await reportService.reportUser(numericUserId, {
        category,
        description: description.trim(),
        evidence_urls: evidence_urls.length ? evidence_urls : undefined,
      })

      if (result.ok) {
        if (result.data.alreadyExists) {
          toast.info("You have already submitted a report for this user recently. We are reviewing it.")
          setHasAlreadyReported(true)
          setLastReportedAt(new Date())
        } else {
          toast.success("Your report has been submitted successfully. Our team will review it shortly.")
          setHasAlreadyReported(true)
          setLastReportedAt(new Date())
        }
        
        // Close dialog after 2 seconds if successful
        setTimeout(() => {
          onOpenChange(false)
          setCategory("")
          setDescription("")
          setEvidenceText("")
        }, 2000)
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit report. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      setCategory("")
      setDescription("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {userName}
          </DialogTitle>
          <DialogDescription>
            Help us keep our community safe by reporting users who violate our guidelines.
          </DialogDescription>
        </DialogHeader>

        {hasAlreadyReported && (
          <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⏰ You have already reported this user. Please wait 24 hours before reporting again.
              {lastReportedAt && (
                <span className="block text-xs mt-1 text-yellow-600">
                  Last reported: {lastReportedAt.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Reason for Reporting *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {USER_REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide additional details about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Include specific details about what happened and why you&apos;re reporting this user.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Proof (optional)</Label>
              <Textarea
                id="evidence"
                placeholder="Paste links to screenshots or files (comma or newline separated, up to 5)"
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                You can add up to 5 links (images, videos, or documents) as proof.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || hasAlreadyReported || !category || !description.trim() || checkingReport}>
              {checkingReport ? "Checking..." : isSubmitting ? "Submitting..." : hasAlreadyReported ? "Already Reported" : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

