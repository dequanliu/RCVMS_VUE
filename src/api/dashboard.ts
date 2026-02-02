//仪表盘接口
import { http } from '@utils/request'
import type { 
  DashboardStats, 
  DailyStats, 
  CarTypeDistribution,
  RealtimeMonitorData 
} from '@types/api'

export const dashboardApi = {
  // 获取仪表盘统计
  getStats: () => 
    http.get<DashboardStats>('/dashboard/stats'),
  
  // 获取每日统计
  getDailyStats: (startDate: string, endDate: string) => 
    http.get<DailyStats[]>('/dashboard/daily-stats', { startDate, endDate }),
  
  // 获取收入统计
  getRevenueStats: (startDate: string, endDate: string) => 
    http.get('/dashboard/revenue-stats', { startDate, endDate }),
  
  // 获取车辆类型分布
  getCarTypeDistribution: () => 
    http.get<CarTypeDistribution[]>('/dashboard/car-type-distribution'),
  
  // 获取实时监控数据
  getRealtimeMonitor: () => 
    http.get<RealtimeMonitorData>('/dashboard/realtime-monitor')
}