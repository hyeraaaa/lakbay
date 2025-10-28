"use client"
import { Clock, Edit3, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBusinessHours, useBusinessHoursDisplay } from "@/hooks/business-hours/useBusinessHours"
import { getDayDisplayName } from "@/services/businessHoursService"
import BusinessHoursEditor from "./BusinessHoursEditor"

interface BusinessHoursProps {
  isOwner?: boolean
  ownerId?: number // If provided, show hours for specific owner (public view)
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ isOwner = false, ownerId }) => {
  const { businessHours, loading, error, refetch, updateBusinessHours } = useBusinessHours({
    ownerId,
    autoFetch: true
  });
  
  const { getFormattedHoursForDay, hasAnyHoursSet } = useBusinessHoursDisplay(businessHours);

  const days = [
    "MONDAY",
    "TUESDAY", 
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading business hours...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show helpful message for customers viewing without specific owner
  if (!isOwner && !ownerId && businessHours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Business Hours Available</h3>
            <p className="text-muted-foreground">
              To view business hours, please visit a specific host&apos;s profile or vehicle listing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        {isOwner && (
          <CardAction>
            <BusinessHoursEditor 
              onSave={refetch}
              businessHours={businessHours}
              updateBusinessHours={updateBusinessHours}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Customize
              </Button>
            </BusinessHoursEditor>
          </CardAction>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {days.map((day) => (
          <div key={day} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{getDayDisplayName(day)}</span>
            <span className="font-medium text-muted-foreground">
              {getFormattedHoursForDay(day)}
            </span>
          </div>
        ))}
        
        {!hasAnyHoursSet() && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              {isOwner 
                ? "You haven't set your business hours yet" 
                : "This host hasn't set their business hours yet"
              }
            </p>
          </div>
        )}
        
        {isOwner && !hasAnyHoursSet() && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 text-center">
              Click &quot;Customize&quot; to set your business hours and availability
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BusinessHours