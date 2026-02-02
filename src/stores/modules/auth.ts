import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@api/auth'
import { getToken, setToken, removeToken, setUser as setStorageUser } from '@utils/auth'
import type { LoginDto, UserInfo } from '@types/api'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => 
    userInfo.value?.roles.some(r => r.roleCode === 'ADMIN') ?? false
  )
  const permissions = computed(() => 
    userInfo.value?.roles.flatMap(r => r.permissions.map(p => p.permissionCode)) ?? []
  )

  // Actions
  const login = async (data: LoginDto) => {
    loading.value = true
    try {
      const res = await authApi.login(data)
      token.value = res.token
      userInfo.value = res.user
      setToken(res.token)
      setStorageUser(res.user)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      return false
    } finally {
      loading.value = false
    }
  }

  const getUserInfo = async () => {
    try {
      const res = await authApi.getMe()
      userInfo.value = res
      setStorageUser(res)
      return res
    } catch (error) {
      return null
    }
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    removeToken()
    ElMessage.success('已退出登录')
  }

  const refreshToken = async () => {
    try {
      const res = await authApi.refreshToken()
      token.value = res.token
      setToken(res.token)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    isAdmin,
    permissions,
    login,
    getUserInfo,
    logout,
    refreshToken
  }
})