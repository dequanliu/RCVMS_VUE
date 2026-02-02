import { createApp } from 'vue'
import App from './App.vue'

// Plugins
import router from './router'
import pinia from './stores'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// UI Library
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Global Styles
import './assets/css/global.css'

// Utils
import { formatDate, formatDuration } from './utils/date'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 全局属性
app.config.globalProperties.$filters = {
  date: formatDate,
  duration: formatDuration
}

// 使用插件
app.use(pinia)
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
    size: 'default',
    zIndex: 3000,
    button: {
      autoInsertSpace: true
    }
  })

// 权限指令
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const authStore = pinia.state.value.auth?.userInfo
    
    if (value && Array.isArray(value)) {
      const hasPermission = value.some(perm => {
        return authStore?.permissions?.includes(perm) || 
               authStore?.permissions?.includes('*')
      })
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
})

// 加载储物状态后挂载应用
router.isReady().then(() => {
  app.mount('#app')
})