// src/utils/menu.ts
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  children?: MenuItem[]
}

export function useMenu() {
  const router = useRouter()
  
  const menuItems = computed(() => {
    const routes = router.getRoutes()
    const layoutRoute = routes.find(route => route.name === 'Layout')
    
    if (!layoutRoute || !layoutRoute.children) {
      return []
    }

    return layoutRoute.children
      .filter(route => {
        const meta = route.meta || {}
        return !meta.hideInMenu && route.path !== '/'
      })
      .map(route => {
        const children = route.children?.filter(child => {
          const childMeta = child.meta || {}
          return !childMeta.hideInMenu && child.path !== ''
        }) || []

        const menuItem: MenuItem = {
          path: route.path,
          name: route.name as string,
          title: route.meta?.title as string || '',
          icon: route.meta?.icon as string
        }

        if (children.length > 0) {
          menuItem.children = children.map(child => ({
            path: child.path,
            name: child.name as string,
            title: child.meta?.title as string || '',
            icon: child.meta?.icon as string
          }))
        }

        return menuItem
      })
  })

  return {
    menuItems
  }
}

// 根据权限过滤菜单
export function filterMenuByPermission(menuItems: MenuItem[], userPermissions: string[]): MenuItem[] {
  return menuItems.filter(item => {
    // 这里可以根据权限逻辑过滤菜单项
    // 例如：检查 item.name 是否在 userPermissions 中
    return true // 暂时返回所有菜单，实际使用时需要根据权限过滤
  })
}