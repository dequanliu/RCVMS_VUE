<template>
  <el-config-provider 
    :locale="locale" 
    :size="size" 
    :z-index="zIndex"
    :button="buttonConfig"
  >
    <div class="app-wrapper" :class="{ 'dark': isDark }">
      <!-- 全局加载遮罩 -->
      <div v-if="appStore.loading" class="global-loading">
        <el-spin :size="50" :tip="appStore.loadingText" />
      </div>

      <!-- 主内容区域 -->
      <router-view v-slot="{ Component, route }">
        <transition 
          name="fade-transform" 
          mode="out-in"
          appear
        >
          <keep-alive :max="10" :include="cachedViews">
            <component 
              :is="Component" 
              :key="route.fullPath"
              v-if="!appStore.loading"
            />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useAppStore } from './stores/modules/app'
import { useAuthStore } from './stores/modules/auth'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

// Element Plus 配置
const locale = ref(zhCn)
const size = ref<'large' | 'default' | 'small'>('default')
const zIndex = ref(3000)
const buttonConfig = ref({ autoInsertSpace: true })

// 主题切换
const isDark = computed(() => appStore.theme === 'dark')

// 缓存的视图（用于 keep-alive）
const cachedViews = ref<string[]>([])

// 监听路由变化，管理缓存
watch(() => route.meta.keepAlive, (val) => {
  if (val && route.name && !cachedViews.value.includes(route.name as string)) {
    cachedViews.value.push(route.name as string)
  }
}, { immediate: true })

// 初始化主题
onMounted(() => {
  // 检查系统偏好
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  if (mediaQuery.matches && !localStorage.getItem('theme')) {
    appStore.setTheme('dark')
  }
  
  // 监听系统主题变化
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      appStore.setTheme(e.matches ? 'dark' : 'light')
    }
  })
  
  // 初始化时获取用户信息（如果有 token）
  if (authStore.token && !authStore.userInfo) {
    authStore.getUserInfo().catch(() => {
      // Token 无效，会在拦截器中处理
    })
  }
})
</script>

<style>
/* 全局过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 页面切换动画 */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 全局加载样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.dark .global-loading {
  background: rgba(0, 0, 0, 0.9);
}

.app-wrapper {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-regular);
  transition: background-color 0.3s, color 0.3s;
}

/* 滚动条全局样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-info) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: var(--color-info);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>