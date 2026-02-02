//车辆管理接口
import { http } from '@utils/request'
import type { 
  CreateCarDto, 
  UpdateCarDto, 
  SelfRegisterCarDto, 
  CarInfo, 
  PaginatedResponse,
  PaginationParams 
} from '@types/api'

export const carsApi = {
  // 获取车辆列表
  getCars: (params?: PaginationParams & { carType?: string }) => 
    http.get<PaginatedResponse<CarInfo>>('/cars', params),
  
  // 创建车辆
  createCar: (data: CreateCarDto) => 
    http.post<CarInfo>('/cars', data),
  
  // 获取车辆详情
  getCarById: (id: number) => 
    http.get<CarInfo>(`/cars/${id}`),
  
  // 更新车辆
  updateCar: (id: number, data: UpdateCarDto) => 
    http.put<CarInfo>(`/cars/${id}`, data),
  
  // 删除车辆
  deleteCar: (id: number) => 
    http.delete(`/cars/${id}`),
  
  // 搜索车辆
  searchCars: (licensePlate: string) => 
    http.get<CarInfo[]>('/cars/search', { licensePlate }),
  
  // 自助登记
  selfRegister: (data: SelfRegisterCarDto) => 
    http.post('/cars/self-register', data),
  
  // 获取车辆记录
  getCarRecords: (id: number, params?: { startDate?: string; endDate?: string }) => 
    http.get(`/cars/${id}/records`, params),
  
  // 更新车辆状态
  updateCarStatus: (id: number, status: string) => 
    http.put(`/cars/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    })
}