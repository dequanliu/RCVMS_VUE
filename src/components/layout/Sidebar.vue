<template>
  <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
    <div class="logo">
      <img src="/logo.png" alt="logo" v-if="!isCollapse">
      <span v-else>RC</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path" v-show="!item.hidden">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@store/modules/app'

const route = useRoute()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'Odometer' },
  { path: '/cars', title: '车辆管理', icon: 'Van' },
  { path: '/parking/records', title: '进出记录', icon: 'List' },
  { path: '/parking/spaces', title: '停车位', icon: 'OfficeBuilding' },
  { path: '/fees/records', title: '费用记录', icon: 'Money' },
  { path: '/fees/rules', title: '收费规则', icon: 'Collection' },
  { path: '/system/users', title: '用户管理', icon: 'UserFilled' },
  { path: '/system/roles', title: '角色管理', icon: 'Avatar' },
  { path: '/system/logs', title: '操作日志', icon: 'Document' },
  { path: '/system/configs', title: '系统配置', icon: 'Setting' }
]
</script>

<style scoped>
.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.logo img {
  height: 40px;
}

.el-menu {
  border-right: none;
}
</style>