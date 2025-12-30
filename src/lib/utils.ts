import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse date string, supports multiple formats
 * @param dateString - Date string, supports DD.MM.YYYY, YYYY-MM-DD and other formats
 * @returns Date object, returns null if parsing fails
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try to parse DD.MM.YYYY format (e.g.: "19.12.2025")
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // Validate if date is valid
    if (date.getFullYear() === parseInt(year) && 
        date.getMonth() === parseInt(month) - 1 && 
        date.getDate() === parseInt(day)) {
      return date;
    }
  }
  
  // Try using standard Date constructor to parse other formats
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}
