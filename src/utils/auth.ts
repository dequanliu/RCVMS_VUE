import { ref } from 'vue'

const TOKEN_KEY = 'rcvms_token'
const USER_KEY = 'rcvms_user'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// 权限检查
export const hasPermission = (permissions: string[], permission: string): boolean => {
  return permissions.includes(permission) || permissions.includes('*')
}

// 获取Token剩余时间（如果Token是JWT格式）
export const getTokenExpireTime = (token: string): number => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const { exp } = JSON.parse(jsonPayload)
    return exp ? exp * 1000 - Date.now() : 0
  } catch {
    return 0
  }
}