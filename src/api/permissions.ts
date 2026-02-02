//权限管理接口
import { http } from '@utils/request'
import type { CreatePermissionDto, Permission } from '@types/api'

export const permissionsApi = {
  // 获取权限列表
  getPermissions: () => 
    http.get<Permission[]>('/permissions'),
  
  // 创建权限
  createPermission: (data: CreatePermissionDto) => 
    http.post<Permission>('/permissions', data)
}