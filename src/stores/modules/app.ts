import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const loading = ref(false)
  const loadingText = ref('')

  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setTheme = (val: 'light' | 'dark') => {
    theme.value = val
    document.documentElement.className = val
  }

  const setLanguage = (val: string) => {
    language.value = val
  }

  const setLoading = (status: boolean, text = '') => {
    loading.value = status
    loadingText.value = text
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    loading,
    loadingText,
    toggleSidebar,
    setTheme,
    setLanguage,
    setLoading
  }
})