//操作日志接口
import { http } from '@utils/request'
import type { 
  CreateLogDto, 
  OperationLog,
  PaginatedResponse,
  PaginationParams 
} from '@types/api'

export const operationLogsApi = {
  // 获取操作日志列表
  getLogs: (params?: PaginationParams & { 
    startDate?: string; 
    endDate?: string;
    operationType?: string;
    username?: string;
  }) => 
    http.get<PaginatedResponse<OperationLog>>('/operation-logs', params),
  
  // 创建操作日志
  createLog: (data: CreateLogDto) => 
    http.post('/operation-logs', data),
  
  // 获取用户操作日志
  getUserLogs: (userId: number, params?: { startDate?: string; endDate?: string }) => 
    http.get<OperationLog[]>(`/operation-logs/user/${userId}`, params),
  
  // 清理日志
  cleanup: (days = 90) => 
    http.delete('/operation-logs/cleanup', { days })
}