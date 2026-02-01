// src/types/router.d.ts
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  hideInMenu?: boolean
  keepAlive?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    hideInMenu?: boolean
    keepAlive?: boolean
  }
}