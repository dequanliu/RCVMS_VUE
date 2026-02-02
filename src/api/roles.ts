//角色管理接口
import { http } from '@utils/request'
import type { CreateRoleDto, Role } from '@types/api'

export const rolesApi = {
  // 获取角色列表
  getRoles: () => 
    http.get<Role[]>('/roles'),
  
  // 创建角色
  createRole: (data: CreateRoleDto) => 
    http.post<Role>('/roles', data),
  
  // 获取角色详情
  getRoleById: (id: number) => 
    http.get<Role>(`/roles/${id}`),
  
  // 更新角色
  updateRole: (id: number, data: CreateRoleDto) => 
    http.put<Role>(`/roles/${id}`, data),
  
  // 删除角色
  deleteRole: (id: number) => 
    http.delete(`/roles/${id}`),
  
  // 分配权限
  assignPermissions: (id: number, permissionIds: number[]) => 
    http.post(`/roles/${id}/permissions`, permissionIds)
}