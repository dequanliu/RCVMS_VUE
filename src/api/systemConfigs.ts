//系统配置接口
import { http } from '@utils/request'
import type { UpdateConfigDto } from '@types/api'

export const systemConfigsApi = {
  // 获取所有配置
  getConfigs: () => 
    http.get<Record<string, string>>('/system-configs'),
  
  // 根据分类获取配置
  getConfigsByCategory: (category: string) => 
    http.get<Record<string, string>>(`/system-configs/by-category/${category}`),
  
  // 获取特定配置
  getConfig: (key: string) => 
    http.get<string>(`/system-configs/${key}`),
  
  // 更新配置
  updateConfig: (key: string, data: UpdateConfigDto) => 
    http.put(`/system-configs/${key}`, data),
  
  // 批量更新
  batchUpdate: (data: Record<string, string>) => 
    http.put('/system-configs/batch', data)
}