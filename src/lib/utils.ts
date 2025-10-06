import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date and time string into a consistent ISO format
 * @param date - The date object
 * @param time - Time string in format "HH:MM AM/PM"
 * @returns Formatted datetime string in ISO format (YYYY-MM-DDTHH:mm:ss)
 */
export function formatDateTime(date: Date, time: string): string {
  const [timeStr, period] = time.split(' ')
  const [hours, minutes] = timeStr.split(':')
  let hour24 = parseInt(hours)
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0
  }
  
  // Create date in local timezone
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  
  const newDate = new Date(year, month, day, hour24, parseInt(minutes), 0, 0)
  
  // Format as local ISO string (YYYY-MM-DDTHH:mm:ss) without timezone conversion
  const yearStr = newDate.getFullYear().toString().padStart(4, '0')
  const monthStr = (newDate.getMonth() + 1).toString().padStart(2, '0')
  const dayStr = newDate.getDate().toString().padStart(2, '0')
  const hourStr = newDate.getHours().toString().padStart(2, '0')
  const minuteStr = newDate.getMinutes().toString().padStart(2, '0')
  const secondStr = newDate.getSeconds().toString().padStart(2, '0')
  
  return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`
}
