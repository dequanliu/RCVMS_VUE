import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@store/modules/auth'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@views/auth/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@views/auth/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@components/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@views/dashboard/Index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: '/cars',
        name: 'Cars',
        component: () => import('@views/cars/CarList.vue'),
        meta: { title: '车辆管理', icon: 'Van' }
      },
      {
        path: '/cars/register',
        name: 'CarRegister',
        component: () => import('@views/cars/SelfRegister.vue'),
        meta: { title: '车辆登记', hidden: true }
      },
      {
        path: '/cars/:id',
        name: 'CarDetail',
        component: () => import('@views/cars/CarDetail.vue'),
        meta: { title: '车辆详情', hidden: true }
      },
      {
        path: '/parking/records',
        name: 'InOutRecords',
        component: () => import('@views/parking/InOutRecords.vue'),
        meta: { title: '进出记录', icon: 'List' }
      },
      {
        path: '/parking/enter',
        name: 'EnterRecord',
        component: () => import('@views/parking/EnterRecord.vue'),
        meta: { title: '入场登记', icon: 'CirclePlus' }
      },
      {
        path: '/parking/exit',
        name: 'ExitRecord',
        component: () => import('@views/parking/ExitRecord.vue'),
        meta: { title: '出场登记', icon: 'Remove' }
      },
      {
        path: '/parking/manual',
        name: 'ManualRecord',
        component: () => import('@views/parking/ManualRecord.vue'),
        meta: { title: '手动登记', icon: 'Edit' }
      },
      {
        path: '/parking/spaces',
        name: 'ParkingSpaces',
        component: () => import('@views/parking/ParkingSpaces.vue'),
        meta: { title: '停车位', icon: 'OfficeBuilding' }
      },
      {
        path: '/fees/records',
        name: 'FeeRecords',
        component: () => import('@views/fees/FeeRecords.vue'),
        meta: { title: '费用记录', icon: 'Money' }
      },
      {
        path: '/fees/payment',
        name: 'Payment',
        component: () => import('@views/fees/Payment.vue'),
        meta: { title: '缴费', icon: 'CreditCard' }
      },
      {
        path: '/fees/rules',
        name: 'FeeRules',
        component: () => import('@views/fees/FeeRules.vue'),
        meta: { title: '收费规则', icon: 'Collection' }
      },
      {
        path: '/fees/my',
        name: 'MyFees',
        component: () => import('@views/fees/MyFees.vue'),
        meta: { title: '我的费用', icon: 'Wallet' }
      },
      {
        path: '/system/users',
        name: 'Users',
        component: () => import('@views/system/Users.vue'),
        meta: { title: '用户管理', icon: 'UserFilled' }
      },
      {
        path: '/system/roles',
        name: 'Roles',
        component: () => import('@views/system/Roles.vue'),
        meta: { title: '角色管理', icon: 'Avatar' }
      },
      {
        path: '/system/permissions',
        name: 'Permissions',
        component: () => import('@views/system/Permissions.vue'),
        meta: { title: '权限管理', icon: 'Lock' }
      },
      {
        path: '/system/logs',
        name: 'OperationLogs',
        component: () => import('@views/system/OperationLogs.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      },
      {
        path: '/system/configs',
        name: 'SystemConfigs',
        component: () => import('@views/system/SystemConfigs.vue'),
        meta: { title: '系统配置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.public) {
    next()
    return
  }
  
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }
  
  // 获取用户信息（如果不存在）
  if (!authStore.userInfo) {
    const success = await authStore.getUserInfo()
    if (!success) {
      authStore.logout()
      next('/login')
      return
    }
  }
  
  next()
})

export default router