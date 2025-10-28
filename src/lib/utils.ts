import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Philippine timezone constant
export const PHILIPPINE_TIMEZONE = 'Asia/Manila'

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

/**
 * Formats a date to YYYY-MM-DD format
 * Uses local date components to preserve the calendar date regardless of timezone
 * @param date - The date to format (Date object)
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToPhilippine(date: Date | string | undefined): string | undefined {
  if (!date) return undefined
  
  let d: Date
  if (typeof date === 'string') {
    // If it's already a string in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date
    }
    d = new Date(date)
  } else {
    d = date
  }
  
  // Use local date components to preserve the "calendar date" the user sees
  // This avoids timezone conversion issues
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Creates a date from YYYY-MM-DD string
 * Treats the date as a "calendar date" without timezone conversion
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parsePhilippineDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined
  
  // Parse the date string and create a Date in local timezone
  // The time component is set to noon to avoid any date shift issues
  const [year, month, day] = dateStr.split('-').map(Number)
  if (year && month && day) {
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }
  
  return undefined
}
