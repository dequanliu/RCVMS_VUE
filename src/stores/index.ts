// src/store/index.ts
import { createPinia } from 'pinia'
import type { App } from 'vue'
import { useAppStore } from './modules/app'

// 持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 重置所有 store 的方法（用于开发环境）
export function resetAllStores() {
  const stores = pinia.state.value
  Object.keys(stores).forEach((key) => {
    const store = stores[key]
    if (store.$reset) {
      store.$reset()
    }
  })
}

// 安装函数
export function setupStore(app: App) {
  app.use(pinia)
  
  // 初始化 app store
  const appStore = useAppStore()
  appStore.initApp()
}

export default pinia