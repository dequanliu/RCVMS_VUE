import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@store/modules/auth'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求队列（用于取消重复请求）
const pendingMap = new Map<string, AbortController>()

// 获取请求标识
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}_${config.url}_${JSON.stringify(config.params)}_${JSON.stringify(config.data)}`
}

// 移除请求
const removeRequest = (config: InternalAxiosRequestConfig) => {
  const key = getRequestKey(config)
  const controller = pendingMap.get(key)
  if (controller) {
    controller.abort()
    pendingMap.delete(key)
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 移除重复请求
    removeRequest(config)
    
    // 添加取消控制器
    const controller = new AbortController()
    config.signal = controller.signal
    pendingMap.set(getRequestKey(config), controller)
    
    // 添加Token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 移除请求
    removeRequest(response.config)
    
    const { data } = response
    
    // 如果响应成功但业务逻辑错误
    if (data.success === false) {
      ElMessage.error(data.message || '操作失败')
      return Promise.reject(new Error(data.message))
    }
    
    return data.data
  },
  (error: AxiosError) => {
    // 移除请求
    if (error.config) {
      removeRequest(error.config)
    }
    
    // 处理取消请求
    if (error.name === 'AbortError' || error.message === 'canceled') {
      return Promise.reject(error)
    }
    
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const authStore = useAuthStore()
            authStore.logout()
            window.location.href = '/login'
          })
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    
    return Promise.reject(error)
  }
)

// 导出请求方法
export const http = {
  get: <T>(url: string, params?: object): Promise<T> => 
    request.get(url, { params }) as Promise<T>,
  
  post: <T>(url: string, data?: object): Promise<T> => 
    request.post(url, data) as Promise<T>,
  
  put: <T>(url: string, data?: object): Promise<T> => 
    request.put(url, data) as Promise<T>,
  
  delete: <T>(url: string, params?: object): Promise<T> => 
    request.delete(url, { params }) as Promise<T>,
  
  patch: <T>(url: string, data?: object): Promise<T> => 
    request.patch(url, data) as Promise<T>
}

export default request