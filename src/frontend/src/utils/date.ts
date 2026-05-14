/**
 * 日期格式化工具函数
 * 使用 Intl.DateTimeFormat 处理时区，默认使用 Asia/Shanghai（产线时区）
 * 所有服务端时间均为 UTC，客户端转换为产线时区显示
 */

const DEFAULT_TIMEZONE = 'Asia/Shanghai'

export function formatDate(dateStr: string, locale = 'zh-CN', timeZone = DEFAULT_TIMEZONE): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(date)
}

export function formatDateTime(dateStr: string, locale = 'zh-CN', timeZone = DEFAULT_TIMEZONE): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

/**
 * 格式化日期为 dhtmlx-gantt 兼容的 YYYY-MM-DD HH:mm 格式
 * 使用时区转换确保产线时区一致
 */
export function formatGanttDate(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  const datePart = date.toLocaleString('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const timePart = date.toLocaleString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false })
  return `${datePart} ${timePart}`
}
