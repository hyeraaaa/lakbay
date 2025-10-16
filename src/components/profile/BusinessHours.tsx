"use client"
import { Clock, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card"

interface BusinessHoursProps {
  isOwner?: boolean
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ isOwner = false }) => {
  const days = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        {isOwner && (
          <CardAction>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Customize
            </Button>
          </CardAction>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {days.map((day) => (
          <div key={day} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{day}</span>
            <span className="font-medium text-muted-foreground">
              {isOwner ? "Set your hours" : "Hours not set"}
            </span>
          </div>
        ))}
        
        {!isOwner && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              This host hasn&apos;t set their business hours yet
            </p>
          </div>
        )}
        
        {isOwner && (
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
