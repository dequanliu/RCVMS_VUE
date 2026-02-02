<template>
  <el-header class="header">
    <div class="left">
      <el-icon class="collapse-btn" @click="toggleSidebar">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
      <breadcrumb />
    </div>
    <div class="right">
      <el-badge :value="unpaidCount" class="message-badge" v-if="unpaidCount > 0">
        <el-icon class="icon-btn" @click="goToMyFees"><Bell /></el-icon>
      </el-badge>
      
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          {{ userInfo?.realName || userInfo?.username }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@store/modules/auth'
import { useAppStore } from '@store/modules/app'
import { feeRecordsApi } from '@api/feeRecords'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, Bell, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapsed)
const userInfo = computed(() => authStore.userInfo)
const unpaidCount = ref(0)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const goToMyFees = () => {
  router.push('/fees/my')
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        authStore.logout()
        router.push('/login')
      })
      break
    case 'profile':
      router.push(`/system/users/${userInfo.value?.id}`)
      break
    case 'changePassword':
      // 打开修改密码对话框
      break
  }
}

onMounted(async () => {
  // 获取未支付费用数量
  try {
    const records = await feeRecordsApi.getUnpaidRecords()
    unpaidCount.value = records.length
  } catch (error) {
    console.error('获取未支付费用失败', error)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  height: 60px;
}

.left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

.message-badge {
  margin-right: 10px;
}
</style>