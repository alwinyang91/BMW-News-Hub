import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 解析日期字符串，支持多种格式
 * @param dateString - 日期字符串，支持 DD.MM.YYYY, YYYY-MM-DD 等格式
 * @returns Date 对象，如果解析失败则返回 null
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // 尝试解析 DD.MM.YYYY 格式 (例如: "19.12.2025")
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // 验证日期是否有效
    if (date.getFullYear() === parseInt(year) && 
        date.getMonth() === parseInt(month) - 1 && 
        date.getDate() === parseInt(day)) {
      return date;
    }
  }
  
  // 尝试使用标准 Date 构造函数解析其他格式
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}
