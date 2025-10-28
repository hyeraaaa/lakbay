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

interface VehicleReportDialogProps {
  vehicleId: string
  vehicleName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VEHICLE_REPORT_CATEGORIES = [
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "graphic_content", label: "Graphic Content" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "fraud_misrepresentation", label: "Fraud/Misrepresentation" },
  { value: "prohibited_modifications", label: "Prohibited Modifications" },
  { value: "spam_duplicate", label: "Spam/Duplicate" },
  { value: "deceptive_pricing", label: "Deceptive Pricing" },
  { value: "copyright_violation", label: "Copyright Violation" },
  { value: "unsafe_vehicle", label: "Unsafe Vehicle" },
  { value: "location_misrepresentation", label: "Location Misrepresentation" },
  { value: "other", label: "Other" },
]

export default function VehicleReportDialog({ vehicleId, vehicleName, open, onOpenChange }: VehicleReportDialogProps) {
  const [category, setCategory] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAlreadyReported, setHasAlreadyReported] = useState(false)
  const [checkingReport, setCheckingReport] = useState(false)
  const [lastReportedAt, setLastReportedAt] = useState<Date | null>(null)

  const { user, isAuthenticated } = useJWT()

  // Check if user has already reported this vehicle when dialog opens
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!open || !isAuthenticated || !user) {
        setHasAlreadyReported(false)
        return
      }

      setCheckingReport(true)
      try {
        const result = await reportService.getMyReports({ 
          entity_type: 'vehicle',
          limit: 100 
        })
        
        if (result.ok) {
          const numericVehicleId = parseInt(vehicleId)
          const now = new Date()
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          
          const existingReport = result.data.reports.find(report => 
            report.reported_entity_id === numericVehicleId &&
            report.reported_entity_type === 'vehicle' &&
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
  }, [open, isAuthenticated, user, vehicleId])

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
      const numericVehicleId = parseInt(vehicleId)
      if (isNaN(numericVehicleId)) {
        throw new Error("Invalid vehicle ID")
      }

      const result = await reportService.reportVehicle(numericVehicleId, {
        category,
        description: description.trim(),
      })

      if (result.ok) {
        if (result.data.alreadyExists) {
          toast.info("You have already submitted a report for this vehicle recently. We are reviewing it.")
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
            Report Vehicle
          </DialogTitle>
          <DialogDescription>
            Report this vehicle: {vehicleName}
          </DialogDescription>
        </DialogHeader>

        {hasAlreadyReported && (
          <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⏰ You have already reported this vehicle. Please wait 24 hours before reporting again.
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
                  {VEHICLE_REPORT_CATEGORIES.map((cat) => (
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
                Include specific details about what happened and why you&apos;re reporting this vehicle.
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

