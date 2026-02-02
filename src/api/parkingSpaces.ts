//车位管理接口
import { http } from '@utils/request'
import type { 
  CreateParkingSpaceDto, 
  UpdateParkingSpaceDto,
  ParkingSpace 
} from '@types/api'

export const parkingSpacesApi = {
  // 获取停车位列表
  getParkingSpaces: (params?: { spaceType?: string; status?: string }) => 
    http.get<ParkingSpace[]>('/parking-spaces', params),
  
  // 创建停车位
  createParkingSpace: (data: CreateParkingSpaceDto) => 
    http.post<ParkingSpace>('/parking-spaces', data),
  
  // 获取可用停车位
  getAvailableSpaces: () => 
    http.get<ParkingSpace[]>('/parking-spaces/available'),
  
  // 获取停车位详情
  getParkingSpaceById: (id: number) => 
    http.get<ParkingSpace>(`/parking-spaces/${id}`),
  
  // 更新停车位
  updateParkingSpace: (id: number, data: UpdateParkingSpaceDto) => 
    http.put<ParkingSpace>(`/parking-spaces/${id}`, data),
  
  // 删除停车位
  deleteParkingSpace: (id: number) => 
    http.delete(`/parking-spaces/${id}`),
  
  // 分配停车位
  assignSpace: (id: number, ownerId: number) => 
    http.post(`/parking-spaces/${id}/assign`, ownerId)
}