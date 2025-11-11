"use client"
import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string | null
  onChange: (value: string) => void
  id?: string
  placeholder?: string
}

// Generate time slots with 30-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
}

// Convert 24-hour format to 12-hour format for display
const formatTime12Hour = (time24: string | null): string => {
  if (!time24) return ""
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  id,
  placeholder = "Select time"
}) => {
  const [open, setOpen] = useState(false)
  const timeSlots = generateTimeSlots()

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setOpen(false)
  }

  const displayValue = formatTime12Hour(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-1">
            {timeSlots.map((time) => {
              const isSelected = value === time
              const displayTime = formatTime12Hour(time)
              
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-9 justify-center text-sm font-normal",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleTimeSelect(time)}
                >
                  {displayTime}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker

