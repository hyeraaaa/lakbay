"use client"
import { useState, useEffect } from "react"
import { Clock, Save, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBusinessHours } from "@/hooks/business-hours/useBusinessHours"
import { BusinessHour, getAllDays, getDayDisplayName, convertTo24Hour, convertTo12Hour } from "@/services/businessHoursService"
import { toast } from "sonner"

interface BusinessHoursEditorProps {
  children: React.ReactNode
  onSave?: () => void // Callback to notify parent when changes are saved
  businessHours?: BusinessHour[] // Pass current business hours from parent
  updateBusinessHours?: (hours: BusinessHour[]) => Promise<BusinessHour[]> // Pass update function from parent
}

const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ 
  children, 
  onSave, 
  businessHours: parentBusinessHours, 
  updateBusinessHours: parentUpdateBusinessHours 
}) => {
  const [open, setOpen] = useState(false)
  const [editingHours, setEditingHours] = useState<BusinessHour[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  
  // Use parent's data if provided, otherwise use own hook
  const { businessHours: hookBusinessHours, loading, error, updateBusinessHours: hookUpdateBusinessHours } = useBusinessHours({
    autoFetch: !parentBusinessHours // Only auto-fetch if parent didn't provide data
  })

  // Use parent's data and functions if provided, otherwise use hook's
  const businessHours = parentBusinessHours || hookBusinessHours
  const updateBusinessHours = parentUpdateBusinessHours || hookUpdateBusinessHours

  // Initialize editing hours when dialog opens
  useEffect(() => {
    if (open && businessHours.length > 0) {
      setEditingHours([...businessHours])
    } else if (open && businessHours.length === 0) {
      // Create default hours for all days
      const defaultHours = getAllDays().map(day => ({
        day_of_week: day,
        is_open: false,
        opening_time: null,
        closing_time: null
      }))
      setEditingHours(defaultHours)
    }
  }, [open, businessHours])

  const handleDayToggle = (dayOfWeek: string, isOpen: boolean) => {
    setEditingHours(prev => 
      prev.map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { 
              ...hour, 
              is_open: isOpen,
              opening_time: isOpen ? hour.opening_time || "09:00" : null,
              closing_time: isOpen ? hour.closing_time || "17:00" : null
            }
          : hour
      )
    )
    setHasChanges(true)
  }

  const handleTimeChange = (dayOfWeek: string, field: 'opening_time' | 'closing_time', value: string) => {
    // Convert 12-hour format to 24-hour format
    const time24 = convertTo24Hour(value)
    
    setEditingHours(prev => 
      prev.map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { ...hour, [field]: time24 }
          : hour
      )
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const updatedHours = await updateBusinessHours(editingHours)
      setHasChanges(false)
      setOpen(false)
      toast.success("Business hours updated successfully")
      // Notify parent component to refetch data (as backup)
      onSave?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update business hours")
    }
  }

  const handleCancel = () => {
    setEditingHours([...businessHours])
    setHasChanges(false)
    setOpen(false)
  }

  const getDayHours = (dayOfWeek: string): BusinessHour | undefined => {
    return editingHours.find(hour => hour.day_of_week === dayOfWeek)
  }

  const formatTimeForInput = (time24: string | null): string => {
    if (!time24) return ""
    return convertTo12Hour(time24)
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours Editor
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading business hours...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours Editor
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {getAllDays().map((day) => {
            const dayHours = getDayHours(day)
            if (!dayHours) return null

            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{getDayDisplayName(day)}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`switch-${day}`}>Open</Label>
                      <Switch
                        id={`switch-${day}`}
                        checked={dayHours.is_open}
                        onCheckedChange={(checked) => handleDayToggle(day, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {dayHours.is_open && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`open-${day}`}>Opening Time</Label>
                        <Input
                          id={`open-${day}`}
                          type="text"
                          placeholder="9:00 AM"
                          value={formatTimeForInput(dayHours.opening_time)}
                          onChange={(e) => handleTimeChange(day, 'opening_time', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`close-${day}`}>Closing Time</Label>
                        <Input
                          id={`close-${day}`}
                          type="text"
                          placeholder="5:00 PM"
                          value={formatTimeForInput(dayHours.closing_time)}
                          onChange={(e) => handleTimeChange(day, 'closing_time', e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use 12-hour format (e.g., 9:00 AM, 1:30 PM)
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="min-w-[100px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BusinessHoursEditor
