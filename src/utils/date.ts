import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(duration)

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format)
}

export const formatDateOnly = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatTimeOnly = (date: string | Date): string => {
  return dayjs(date).format('HH:mm:ss')
}

export const relativeTimeFromNow = (date: string | Date): string => {
  return dayjs(date).fromNow()
}

// 格式化停车时长（分钟转可读格式）
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
  const days = Math.floor(minutes / 1440)
  const remainingMinutes = minutes % 1440
  const hours = Math.floor(remainingMinutes / 60)
  return hours > 0 ? `${days}天${hours}小时` : `${days}天`
}

// 计算两个时间差（分钟）
export const diffInMinutes = (start: string | Date, end: string | Date): number => {
  return dayjs(end).diff(dayjs(start), 'minute')
}

export const now = (): string => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export const today = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

export default dayjs