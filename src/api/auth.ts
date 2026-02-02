//认证相关接口
import { http } from '@utils/request'
import type { 
  LoginDto, 
  RegisterDto, 
  UserInfo, 
  ApiResponse 
} from '@types/api'

export const authApi = {
  // 登录
  login: (data: LoginDto) => 
    http.post<{ token: string; user: UserInfo }>('/auth/login', data),
  
  // 注册
  register: (data: RegisterDto) => 
    http.post('/auth/register', data),
  
  // 获取当前用户信息
  getMe: () => 
    http.get<UserInfo>('/auth/me'),
  
  // 刷新Token
  refreshToken: () => 
    http.post<{ token: string }>('/auth/refresh-token')
}