//车辆进出记录接口
import { http } from '@utils/request'
import type { 
  EnterDto, 
  ExitDto, 
  ManualRecordDto, 
  CarInOutRecord,
  PaginatedResponse,
  PaginationParams 
} from '@types/api'

export const carInOutRecordsApi = {
  // 获取进出记录列表
  getRecords: (params?: PaginationParams & { 
    startDate?: string; 
    endDate?: string;
    licensePlate?: string;
  }) => 
    http.get<PaginatedResponse<CarInOutRecord>>('/car-in-out-records', params),
  
  // 车辆入场
  enter: (data: EnterDto) => 
    http.post<CarInOutRecord>('/car-in-out-records/enter', data),
  
  // 车辆出场
  exit: (id: number, data: ExitDto) => 
    http.post<CarInOutRecord>(`/car-in-out-records/${id}/exit`, data),
  
  // 获取在场车辆
  getInParking: () => 
    http.get<CarInOutRecord[]>('/car-in-out-records/in-parking'),
  
  // 获取今日统计
  getTodayStats: () => 
    http.get('/car-in-out-records/today-stats'),
  
  // 手动登记
  manualRecord: (data: ManualRecordDto) => 
    http.post('/car-in-out-records/manual', data)
}