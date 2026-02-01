// src/store/modules/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { LoginDto, RegisterDto } from '@/types/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户 token
    accessToken: '',
    refreshToken: '',
    tokenExpiry: 0,
    
    // 用户基本信息
    userInfo: null as {
      id: number
      username: string
      realName: string
      phone: string
      email?: string
      roles: Array<{
        id: number
        roleName: string
        roleCode: string
      }>
      permissions: string[]
    } | null,
    
    // 登录状态
    isLoggedIn: false,
    
    // 重定向路径
    redirectPath: '/dashboard'
  }),
  
  getters: {
    // 是否已认证
    isAuthenticated: (state) => {
      if (!state.isLoggedIn) return false
      if (!state.accessToken) return false
      
      // 检查 token 是否过期
      const now = Math.floor(Date.now() / 1000)
      if (state.tokenExpiry && state.tokenExpiry < now) {
        return false
      }
      
      return true
    },
    
    // 是否是管理员
    isAdmin: (state) => {
      return state.userInfo?.roles?.some(role => role.roleCode === 'admin') || false
    },
    
    // 是否是车主
    isCarOwner: (state) => {
      return state.userInfo?.roles?.some(role => role.roleCode === 'car_owner') || false
    },
    
    // 是否有权限
    hasPermission: (state) => (permissionCode: string) => {
      if (!state.userInfo?.permissions) return false
      return state.userInfo.permissions.includes(permissionCode)
    },
    
    // 是否有任意权限
    hasAnyPermission: (state) => (permissionCodes: string[]) => {
      if (!state.userInfo?.permissions) return false
      return permissionCodes.some(code => state.userInfo!.permissions.includes(code))
    },
    
    // 获取用户ID
    userId: (state) => state.userInfo?.id || null,
    
    // 获取用户名
    username: (state) => state.userInfo?.username || '',
    
    // 获取真实姓名
    realName: (state) => state.userInfo?.realName || ''
  },
  
  actions: {
    // 登录
    async login(loginData: LoginDto) {
      try {
        // 调用登录接口
        const response = await authApi.login(loginData)
        
        // 保存 token 信息
        if (response.data.accessToken) {
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken
          this.tokenExpiry = response.data.expiresIn || 0
          this.isLoggedIn = true
          
          // 保存到 localStorage
          this.saveTokensToStorage()
          
          // 获取用户信息
          await this.fetchUserInfo()
          
          // 设置请求头 token
          this.setAuthHeader()
          
          // 跳转到重定向页面或首页
          const redirect = this.redirectPath || '/dashboard'
          router.push(redirect)
          
          return { success: true }
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },
    
    // 注册
    async register(registerData: RegisterDto) {
      try {
        const response = await authApi.register(registerData)
        
        // 注册成功后自动登录
        if (response.data.success) {
          await this.login({
            username: registerData.username,
            password: registerData.password
          })
        }
        
        return response
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await authApi.getCurrentUser()
        this.userInfo = {
          id: response.data.id,
          username: response.data.username,
          realName: response.data.realName,
          phone: response.data.phone,
          email: response.data.email,
          roles: response.data.roles || [],
          permissions: response.data.permissions || []
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 刷新 token
    async refreshToken() {
      if (!this.refreshToken) {
        throw new Error('没有 refresh token')
      }
      
      try {
        const response = await authApi.refreshToken(this.refreshToken)
        
        if (response.data.accessToken) {
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken || this.refreshToken
          this.tokenExpiry = response.data.expiresIn || 0
          
          // 保存到 localStorage
          this.saveTokensToStorage()
          
          // 设置请求头 token
          this.setAuthHeader()
          
          return true
        }
      } catch (error) {
        console.error('刷新 token 失败:', error)
        this.logout()
        throw error
      }
    },
    
    // 退出登录
    logout() {
      // 清除 store 状态
      this.$reset()
      
      // 清除 localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiry')
      localStorage.removeItem('userInfo')
      
      // 清除请求头 token
      this.clearAuthHeader()
      
      // 跳转到登录页
      router.push('/login')
    },
    
    // 检查 token 有效性
    checkTokenValidity() {
      if (!this.isAuthenticated) {
        return false
      }
      
      // 检查是否需要刷新 token
      const now = Math.floor(Date.now() / 1000)
      const bufferTime = 300 // 5分钟缓冲时间
      
      if (this.tokenExpiry && this.tokenExpiry - bufferTime < now) {
        // token 即将过期，尝试刷新
        return this.refreshToken().catch(() => false)
      }
      
      return Promise.resolve(true)
    },
    
    // 初始化认证状态（应用启动时调用）
    async initAuth() {
      // 从 localStorage 恢复 token
      this.restoreTokensFromStorage()
      
      if (this.isAuthenticated) {
        try {
          // 设置请求头 token
          this.setAuthHeader()
          
          // 获取用户信息
          await this.fetchUserInfo()
          
          // 检查 token 有效性
          await this.checkTokenValidity()
          
          return true
        } catch (error) {
          console.error('初始化认证失败:', error)
          this.logout()
          return false
        }
      }
      
      return false
    },
    
    // 保存 token 到 localStorage
    saveTokensToStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)
        localStorage.setItem('tokenExpiry', this.tokenExpiry.toString())
      }
    },
    
    // 从 localStorage 恢复 token
    restoreTokensFromStorage() {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const tokenExpiry = localStorage.getItem('tokenExpiry')
        
        if (accessToken && refreshToken) {
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          this.tokenExpiry = tokenExpiry ? parseInt(tokenExpiry) : 0
          this.isLoggedIn = true
        }
      }
    },
    
    // 设置请求头 token（在 axios 拦截器中调用）
    setAuthHeader() {
      // 这个函数会在 axios 拦截器中调用
      // 实际设置会在 request.ts 中完成
    },
    
    // 清除请求头 token
    clearAuthHeader() {
      // 这个函数会在 axios 拦截器中调用
    },
    
    // 设置重定向路径
    setRedirectPath(path: string) {
      this.redirectPath = path
    },
    
    // 更新用户信息
    updateUserInfo(userData: Partial<NonNullable<typeof this.userInfo>>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...userData }
      }
    },
    
    // 重置 store
    $reset() {
      this.accessToken = ''
      this.refreshToken = ''
      this.tokenExpiry = 0
      this.userInfo = null
      this.isLoggedIn = false
      this.redirectPath = '/dashboard'
    }
  },
  
  // 持久化配置
  persist: {
    key: 'auth-store',
    paths: ['accessToken', 'refreshToken', 'tokenExpiry', 'isLoggedIn', 'redirectPath']
  }
})