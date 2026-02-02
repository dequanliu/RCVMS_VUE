//费用记录接口
import { http } from '@utils/request'
import type { 
  CreatePaymentDto, 
  FeeRecord,
  PaginatedResponse,
  PaginationParams 
} from '@types/api'

export const feeRecordsApi = {
  // 获取费用记录列表
  getFeeRecords: (params?: PaginationParams & { 
    startDate?: string; 
    endDate?: string;
    paymentStatus?: string;
  }) => 
    http.get<PaginatedResponse<FeeRecord>>('/fee-records', params),
  
  // 获取我的费用记录
  getMyRecords: () => 
    http.get<FeeRecord[]>('/fee-records/my-records'),
  
  // 获取未支付记录
  getUnpaidRecords: () => 
    http.get<FeeRecord[]>('/fee-records/unpaid'),
  
  // 支付
  pay: (data: CreatePaymentDto) => 
    http.post('/fee-records/pay', data),
  
  // 获取统计
  getStats: (startDate: string, endDate: string) => 
    http.get('/fee-records/stats', { startDate, endDate }),
  
  // 导出
  export: (startDate: string, endDate: string) => 
    http.get('/fee-records/export', { startDate, endDate })
}