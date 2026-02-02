//用户管理接口
import { http } from '@utils/request'
import type { 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto,
  UserInfo,
  CarInfo,
  Role,
  PaginatedResponse,
  PaginationParams 
} from '@types/api'

export const usersApi = {
  // 获取用户列表
  getUsers: (params?: PaginationParams) => 
    http.get<PaginatedResponse<UserInfo>>('/users', params),
  
  // 创建用户
  createUser: (data: CreateUserDto) => 
    http.post<UserInfo>('/users', data),
  
  // 获取用户详情
  getUserById: (id: number) => 
    http.get<UserInfo>(`/users/${id}`),
  
  // 更新用户
  updateUser: (id: number, data: UpdateUserDto) => 
    http.put<UserInfo>(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id: number) => 
    http.delete(`/users/${id}`),
  
  // 修改密码
  changePassword: (id: number, data: ChangePasswordDto) => 
    http.post(`/users/${id}/change-password`, data),
  
  // 获取用户角色
  getUserRoles: (id: number) => 
    http.get<Role[]>(`/users/${id}/roles`),
  
  // 分配角色
  assignRoles: (id: number, roleIds: number[]) => 
    http.post(`/users/${id}/roles`, roleIds),
  
  // 获取用户车辆
  getUserCars: (id: number) => 
    http.get<CarInfo[]>(`/users/${id}/cars`)
}