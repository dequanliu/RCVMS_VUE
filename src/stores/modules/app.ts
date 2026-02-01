// src/store/modules/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 应用配置
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN',
    sidebarCollapsed: false,
    
    // 页面状态
    loading: false,
    loadingText: '',
    
    // 系统配置
    systemConfigs: {} as Record<string, any>,
    
    // 页面缓存
    cachedViews: [] as string[],
    
    // 全局消息
    messages: [] as Array<{
      id: number
      type: 'success' | 'warning' | 'error' | 'info'
      content: string
      duration?: number
    }>,
    
    // 页面标题
    pageTitle: '小区车辆管理系统'
  }),
  
  getters: {
    // 是否暗黑模式
    isDarkMode: (state) => state.theme === 'dark',
    
    // 是否正在加载
    isLoading: (state) => state.loading,
    
    // 获取系统配置值
    getConfig: (state) => (key: string, defaultValue?: any) => {
      return state.systemConfigs[key] || defaultValue
    }
  },
  
  actions: {
    // 初始化应用
    initApp() {
      // 从 localStorage 恢复主题设置
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.theme = savedTheme
      }
      
      // 从 localStorage 恢复侧边栏状态
      const savedSidebarState = localStorage.getItem('sidebarCollapsed')
      if (savedSidebarState !== null) {
        this.sidebarCollapsed = savedSidebarState === 'true'
      }
      
      // 应用主题
      this.applyTheme()
    },
    
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
      this.applyTheme()
    },
    
    // 应用主题到 DOM
    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    
    // 切换侧边栏状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString())
    },
    
    // 设置侧边栏状态
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
      localStorage.setItem('sidebarCollapsed', collapsed.toString())
    },
    
    // 开始加载
    startLoading(text?: string) {
      this.loading = true
      if (text) {
        this.loadingText = text
      }
    },
    
    // 结束加载
    endLoading() {
      this.loading = false
      this.loadingText = ''
    },
    
    // 添加消息
    addMessage(type: 'success' | 'warning' | 'error' | 'info', content: string, duration = 3000) {
      const id = Date.now()
      this.messages.push({ id, type, content, duration })
      
      // 自动移除消息
      setTimeout(() => {
        this.removeMessage(id)
      }, duration)
    },
    
    // 移除消息
    removeMessage(id: number) {
      const index = this.messages.findIndex(msg => msg.id === id)
      if (index !== -1) {
        this.messages.splice(index, 1)
      }
    },
    
    // 添加缓存视图
    addCachedView(name: string) {
      if (!this.cachedViews.includes(name)) {
        this.cachedViews.push(name)
      }
    },
    
    // 删除缓存视图
    deleteCachedView(name: string) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },
    
    // 清空缓存视图
    clearCachedViews() {
      this.cachedViews = []
    },
    
    // 设置系统配置
    setSystemConfigs(configs: Record<string, any>) {
      this.systemConfigs = { ...this.systemConfigs, ...configs }
    },
    
    // 更新页面标题
    updatePageTitle(title: string) {
      this.pageTitle = title
      document.title = `${title} - 小区车辆管理系统`
    },
    
    // 重置 store
    $reset() {
      this.theme = 'light'
      this.language = 'zh-CN'
      this.sidebarCollapsed = false
      this.loading = false
      this.loadingText = ''
      this.systemConfigs = {}
      this.cachedViews = []
      this.messages = []
      this.pageTitle = '小区车辆管理系统'
      
      // 移除主题类
      document.documentElement.classList.remove('dark')
    }
  },
  
  // 持久化配置
  persist: {
    key: 'app-store',
    paths: ['theme', 'sidebarCollapsed', 'language']
  }
})