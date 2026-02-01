// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

// 公共页面
const publicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 需要认证的路由
const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      // 仪表盘
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'dashboard',
          requiresAuth: true
        }
      },

      // 车辆管理
      {
        path: '/cars',
        name: 'Cars',
        component: () => import('@/views/cars/CarList.vue'),
        meta: {
          title: '车辆管理',
          icon: 'car',
          requiresAuth: true
        }
      },
      {
        path: '/cars/add',
        name: 'CarAdd',
        component: () => import('@/views/cars/CarForm.vue'),
        meta: {
          title: '添加车辆',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/cars/edit/:id',
        name: 'CarEdit',
        component: () => import('@/views/cars/CarForm.vue'),
        props: true,
        meta: {
          title: '编辑车辆',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/cars/detail/:id',
        name: 'CarDetail',
        component: () => import('@/views/cars/CarDetail.vue'),
        props: true,
        meta: {
          title: '车辆详情',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/cars/self-register',
        name: 'CarSelfRegister',
        component: () => import('@/views/cars/SelfRegister.vue'),
        meta: {
          title: '自助登记',
          icon: 'edit',
          requiresAuth: true
        }
      },

      // 停车管理
      {
        path: '/parking/records',
        name: 'ParkingRecords',
        component: () => import('@/views/parking/InOutRecords.vue'),
        meta: {
          title: '进出记录',
          icon: 'history',
          requiresAuth: true
        }
      },
      {
        path: '/parking/enter',
        name: 'ParkingEnter',
        component: () => import('@/views/parking/EnterRecord.vue'),
        meta: {
          title: '车辆入场',
          icon: 'inbox',
          requiresAuth: true
        }
      },
      {
        path: '/parking/exit/:id?',
        name: 'ParkingExit',
        component: () => import('@/views/parking/ExitRecord.vue'),
        props: true,
        meta: {
          title: '车辆出场',
          icon: 'outbox',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/parking/manual',
        name: 'ParkingManual',
        component: () => import('@/views/parking/ManualRecord.vue'),
        meta: {
          title: '手动登记',
          icon: 'form',
          requiresAuth: true
        }
      },
      {
        path: '/parking/spaces',
        name: 'ParkingSpaces',
        component: () => import('@/views/parking/ParkingSpaces.vue'),
        meta: {
          title: '停车位管理',
          icon: 'container',
          requiresAuth: true
        }
      },
      {
        path: '/parking/realtime',
        name: 'ParkingRealtime',
        component: () => import('@/views/parking/RealtimeMonitor.vue'),
        meta: {
          title: '实时监控',
          icon: 'video',
          requiresAuth: true
        }
      },

      // 费用管理
      {
        path: '/fees/records',
        name: 'FeeRecords',
        component: () => import('@/views/fees/FeeRecords.vue'),
        meta: {
          title: '缴费记录',
          icon: 'dollar',
          requiresAuth: true
        }
      },
      {
        path: '/fees/payment',
        name: 'FeePayment',
        component: () => import('@/views/fees/Payment.vue'),
        meta: {
          title: '缴费结算',
          icon: 'pay-circle',
          requiresAuth: true
        }
      },
      {
        path: '/fees/rules',
        name: 'FeeRules',
        component: () => import('@/views/fees/FeeRules.vue'),
        meta: {
          title: '收费规则',
          icon: 'setting',
          requiresAuth: true
        }
      },
      {
        path: '/fees/my-fees',
        name: 'MyFees',
        component: () => import('@/views/fees/MyFees.vue'),
        meta: {
          title: '我的缴费',
          icon: 'wallet',
          requiresAuth: true
        }
      },
      {
        path: '/fees/unpaid',
        name: 'UnpaidFees',
        component: () => import('@/views/fees/MyFees.vue'),
        props: { showUnpaidOnly: true },
        meta: {
          title: '待缴费用',
          icon: 'exclamation-circle',
          requiresAuth: true,
          hideInMenu: true
        }
      },

      // 系统管理
      {
        path: '/system/users',
        name: 'Users',
        component: () => import('@/views/system/Users.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: '/system/roles',
        name: 'Roles',
        component: () => import('@/views/system/Roles.vue'),
        meta: {
          title: '角色管理',
          icon: 'team',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: '/system/permissions',
        name: 'Permissions',
        component: () => import('@/views/system/Permissions.vue'),
        meta: {
          title: '权限管理',
          icon: 'key',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: '/system/logs',
        name: 'OperationLogs',
        component: () => import('@/views/system/OperationLogs.vue'),
        meta: {
          title: '操作日志',
          icon: 'file-text',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: '/system/configs',
        name: 'SystemConfigs',
        component: () => import('@/views/system/SystemConfigs.vue'),
        meta: {
          title: '系统配置',
          icon: 'setting',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/system/Profile.vue'),
        meta: {
          title: '个人中心',
          icon: 'user',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/profile/change-password',
        name: 'ChangePassword',
        component: () => import('@/views/system/ChangePassword.vue'),
        meta: {
          title: '修改密码',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: '/profile/my-cars',
        name: 'MyCars',
        component: () => import('@/views/cars/MyCars.vue'),
        meta: {
          title: '我的车辆',
          requiresAuth: true,
          hideInMenu: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...authRoutes]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 小区车辆管理系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 尝试刷新token
      try {
        await authStore.refreshToken()
      } catch (error) {
        // 刷新失败，跳转到登录页
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // 检查是否仍然未认证
      if (!authStore.isAuthenticated) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/dashboard')
      return
    }
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报逻辑
})

export default router