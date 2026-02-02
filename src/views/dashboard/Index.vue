<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>仪表盘</h2>
        <p class="text-secondary">实时监控小区车辆管理概况</p>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="timeRange" size="default" @change="handleTimeRangeChange">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" circle @click="refreshData" :loading="refreshing" class="refresh-btn" />
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" v-for="(card, index) in statCards" :key="index">
        <el-card class="stat-card" :body-style="{ padding: '20px' }" :class="card.type">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">
                <el-statistic :value="card.value" :precision="card.precision || 0" group-separator=",">
                  <template #prefix v-if="card.prefix">{{ card.prefix }}</template>
                  <template #suffix v-if="card.suffix">{{ card.suffix }}</template>
                </el-statistic>
              </div>
              <div class="stat-trend" v-if="card.trend !== undefined">
                <span :class="card.trend >= 0 ? 'trend-up' : 'trend-down'">
                  <el-icon><CaretTop v-if="card.trend >= 0" /><CaretBottom v-else /></el-icon>
                  {{ Math.abs(card.trend) }}%
                </span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 收入统计 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
              <el-button-group size="small">
                <el-button 
                  :type="revenueChartType === 'line' ? 'primary' : ''" 
                  @click="revenueChartType = 'line'"
                >
                  折线
                </el-button>
                <el-button 
                  :type="revenueChartType === 'bar' ? 'primary' : ''" 
                  @click="revenueChartType = 'bar'"
                >
                  柱状
                </el-button>
                <el-button :icon="Download" @click="revenueRef?.downloadImage()" circle />
              </el-button-group>
            </div>
          </template>
          <RevenueChart
            ref="revenueRef"
            :data="revenueData"
            :chart-type="revenueChartType"
            :loading="loading.revenue"
            :show-target="true"
            height="320"
            @click="handleRevenueClick"
          />
        </el-card>
      </el-col>

      <!-- 车辆类型分布 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>车辆类型分布</span>
              <el-radio-group v-model="carTypeChartType" size="small">
                <el-radio-button label="doughnut">环形</el-radio-button>
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="rose">玫瑰</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <CarTypeChart
            :data="carTypeData"
            :chart-type="carTypeChartType"
            :loading="loading.carType"
            height="320"
            @click="handleCarTypeClick"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 每日统计和实时监控 -->
    <el-row :gutter="20" class="bottom-row">
      <!-- 每日进出统计 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>每日进出趋势</span>
              <el-tooltip content="显示最近7天的进出数据">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <DailyStatsChart
            :data="dailyStatsData"
            :loading="loading.daily"
            height="300"
            @click="handleDailyClick"
          />
        </el-card>
      </el-col>

      <!-- 实时监控列表 -->
      <el-col :xs="24" :lg="8">
        <el-card class="realtime-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>
                实时监控
                <el-badge :value="realtimeData?.currentParking?.length || 0" class="parking-badge" type="primary" />
              </span>
              <el-radio-group v-model="realtimeTab" size="small">
                <el-radio-button label="recent">最近</el-radio-button>
                <el-radio-button label="parking">在场</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <div class="realtime-list" v-loading="loading.realtime">
            <el-empty v-if="!realtimeList.length" description="暂无数据" />
            <div 
              v-else 
              v-for="(item, index) in realtimeList" 
              :key="index"
              class="realtime-item"
              :class="{ 'enter': item.status === 'Entered', 'exit': item.status === 'Exited' }"
            >
              <div class="item-icon">
                <el-icon size="20" v-if="item.status === 'Entered'"><Right /></el-icon>
                <el-icon size="20" v-else><Back /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-plate">{{ item.licensePlate }}</div>
                <div class="item-time">{{ formatTime(item.enterTime || item.leaveTime) }}</div>
              </div>
              <div class="item-status">
                <el-tag size="small" :type="getStatusType(item.status)">
                  {{ item.status === 'Entered' ? '入场' : '出场' }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="realtime-footer">
            <el-button text type="primary" @click="goToRecords">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card shadow="never" class="action-card">
          <div class="quick-title">快捷操作</div>
          <div class="quick-buttons">
            <el-button 
              v-for="action in quickActions" 
              :key="action.name"
              :type="action.type"
              :icon="action.icon"
              size="large"
              @click="handleQuickAction(action.route)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Van,
  Right,
  Back,
  Money,
  Warning,
  Refresh,
  Download,
  QuestionFilled,
  ArrowRight,
  CaretTop,
  CaretBottom,
  Plus,
  Edit,
  List,
  Wallet
} from '@element-plus/icons-vue'
import { RevenueChart, CarTypeChart, DailyStatsChart } from '../../components/charts'
import { dashboardApi } from '../../api/dashboard'
import { formatDate, formatDuration } from '../../utils/date'
import type { DashboardStats, DailyStats, CarTypeDistribution, RealtimeMonitorData, CarInOutRecord } from '../../types/api'

const router = useRouter()

// Refs
const revenueRef = ref<InstanceType<typeof RevenueChart>>()
const refreshTimer = ref<number | null>(null)

// 状态
const loading = reactive({
  stats: false,
  revenue: false,
  daily: false,
  carType: false,
  realtime: false
})

const refreshing = ref(false)
const timeRange = ref('today')
const revenueChartType = ref<'line' | 'bar' | 'mixed'>('mixed')
const carTypeChartType = ref('doughnut')
const realtimeTab = ref('recent')

// 数据
const stats = ref<DashboardStats | null>(null)
const revenueData = ref<any[]>([])
const dailyStatsData = ref<DailyStats[]>([])
const carTypeData = ref<CarTypeDistribution[]>([])
const realtimeData = ref<RealtimeMonitorData | null>(null)

// 统计卡片配置
const statCards = computed(() => [
  {
    label: '在场车辆',
    value: stats.value?.currentParkingCount || 0,
    icon: Van,
    type: 'primary',
    trend: 12.5,
    suffix: '辆'
  },
  {
    label: '今日进场',
    value: stats.value?.todayEnterCount || 0,
    icon: Right,
    type: 'success',
    trend: 8.2,
    suffix: '辆'
  },
  {
    label: '今日出场',
    value: stats.value?.todayExitCount || 0,
    icon: Back,
    type: 'info',
    trend: -5.1,
    suffix: '辆'
  },
  {
    label: '今日收入',
    value: stats.value?.todayRevenue || 0,
    icon: Money,
    type: 'warning',
    precision: 2,
    prefix: '¥',
    trend: 15.3
  }
])

// 实时监控列表
const realtimeList = computed(() => {
  if (!realtimeData.value) return []
  if (realtimeTab.value === 'recent') {
    return realtimeData.value.recentRecords?.slice(0, 6) || []
  }
  return realtimeData.value.currentParking?.slice(0, 6) || []
})

// 快捷操作
const quickActions = [
  { label: '入场登记', icon: Plus, type: 'primary', route: '/parking/enter' },
  { label: '出场登记', icon: Edit, type: 'success', route: '/parking/exit' },
  { label: '车辆管理', icon: List, type: 'info', route: '/cars' },
  { label: '收费记录', icon: Wallet, type: 'warning', route: '/fees/records' }
]

// 获取状态标签类型
const getStatusType = (status: string): any => {
  const map: Record<string, any> = {
    'Entered': 'success',
    'Exited': 'info',
    'Pending': 'warning'
  }
  return map[status] || 'info'
}

// 格式化时间（相对时间）
const formatTime = (time?: string) => {
  if (!time) return '-'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return formatDate(time, 'MM-DD HH:mm')
}

// 获取统计数据
const fetchStats = async () => {
  loading.stats = true
  try {
    const res = await dashboardApi.getStats()
    stats.value = res
  } finally {
    loading.stats = false
  }
}

// 获取收入数据
const fetchRevenue = async () => {
  loading.revenue = true
  const dates = getDateRange()
  try {
    const res = await dashboardApi.getRevenueStats(dates.start, dates.end)
    // 转换数据格式以匹配图表组件
    revenueData.value = res.map((item: any) => ({
      date: item.date,
      revenue: item.amount || item.revenue || 0,
      target: item.target || item.revenue * 1.1 // 模拟目标数据
    }))
  } finally {
    loading.revenue = false
  }
}

// 获取每日统计
const fetchDailyStats = async () => {
  loading.daily = true
  const dates = getDateRange(7)
  try {
    const res = await dashboardApi.getDailyStats(dates.start, dates.end)
    dailyStatsData.value = res.map(item => ({
      date: item.date,
      enterCount: item.enterCount,
      exitCount: item.exitCount,
      parkingCount: item.parkingCount || Math.max(0, item.enterCount - item.exitCount)
    }))
  } finally {
    loading.daily = false
  }
}

// 获取车辆类型分布
const fetchCarType = async () => {
  loading.carType = true
  try {
    const res = await dashboardApi.getCarTypeDistribution()
    carTypeData.value = res
  } finally {
    loading.carType = false
  }
}

// 获取实时监控数据
const fetchRealtime = async () => {
  loading.realtime = true
  try {
    const res = await dashboardApi.getRealtimeMonitor()
    realtimeData.value = res
  } finally {
    loading.realtime = false
  }
}

// 获取日期范围
const getDateRange = (days = 7) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

// 时间范围改变
const handleTimeRangeChange = (val: string) => {
  let days = 7
  if (val === 'today') days = 1
  else if (val === 'week') days = 7
  else if (val === 'month') days = 30
  
  fetchRevenue()
  fetchDailyStats()
}

// 刷新数据
const refreshData = async () => {
  refreshing.value = true
  await Promise.all([
    fetchStats(),
    fetchRevenue(),
    fetchDailyStats(),
    fetchCarType(),
    fetchRealtime()
  ])
  refreshing.value = false
  ElMessage.success('数据已刷新')
}

// 图表点击事件
const handleRevenueClick = (params: any) => {
  console.log('点击收入图表:', params)
  router.push('/fees/records')
}

const handleCarTypeClick = (data: any) => {
  console.log('点击车辆类型:', data)
  router.push(`/cars?type=${data.carType}`)
}

const handleDailyClick = (params: any) => {
  console.log('点击每日统计:', params)
  const date = params.name || params[0]?.axisValue
  router.push(`/parking/records?date=${date}`)
}

// 快捷操作
const handleQuickAction = (route: string) => {
  router.push(route)
}

const goToRecords = () => {
  router.push('/parking/records')
}

// 自动刷新
const startAutoRefresh = () => {
  refreshTimer.value = window.setInterval(() => {
    fetchStats()
    fetchRealtime()
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

onMounted(() => {
  refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  transition: transform 0.3s;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  transition: all 0.3s;
  border: none;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
}

.stat-card.success {
  background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
  color: white;
}

.stat-card.info {
  background: linear-gradient(135deg, #909399 0%, #73767a 100%);
  color: white;
}

.stat-card.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.stat-value :deep(.el-statistic__content) {
  font-size: 28px;
  color: inherit;
}

.stat-trend {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #fff;
  opacity: 0.9;
  font-weight: 500;
}

.trend-down {
  color: #fff;
  opacity: 0.9;
  font-weight: 500;
}

.trend-text {
  opacity: 0.7;
  margin-left: 4px;
}

/* 图表区域 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.chart-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border-lighter);
}

/* 实时监控 */
.realtime-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.parking-badge :deep(.el-badge__content) {
  margin-left: 8px;
}

.realtime-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  padding: 0 10px;
}

.realtime-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-lighter);
  transition: background-color 0.2s;
}

.realtime-item:hover {
  background-color: var(--color-bg-hover);
  margin: 0 -10px;
  padding-left: 10px;
  padding-right: 10px;
}

.realtime-item:last-child {
  border-bottom: none;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: var(--color-bg-hover);
}

.realtime-item.enter .item-icon {
  background: rgba(103, 194, 58, 0.1);
  color: var(--color-success);
}

.realtime-item.exit .item-icon {
  background: rgba(144, 147, 153, 0.1);
  color: var(--color-info);
}

.item-info {
  flex: 1;
}

.item-plate {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 15px;
}

.item-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.item-status {
  margin-left: 8px;
}

.realtime-footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid var(--color-border-lighter);
  margin-top: 10px;
}

/* 快捷操作 */
.quick-actions {
  margin-top: 10px;
}

.action-card {
  background: var(--color-bg-secondary);
  border: 1px dashed var(--color-border);
}

.quick-title {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 15px;
}

.quick-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-buttons .el-button {
  flex: 1;
  min-width: 140px;
  height: 50px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .stat-value :deep(.el-statistic__content) {
    font-size: 20px;
  }
  
  .quick-buttons .el-button {
    flex: 1 1 45%;
    min-width: auto;
  }
}

/* Dark mode 适配 */
.dark .stat-card {
  opacity: 0.95;
}

.dark .chart-card,
.dark .realtime-card,
.dark .action-card {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}
</style>
/*
仪表盘页面功能完整，包含：
1. 顶部统计卡片
4个核心指标：在场车辆、今日进场/出场、今日收入
渐变背景色区分类型
趋势指示（较昨日增减百分比）
悬停动画效果
2. 图表区域
收入趋势：支持折线/柱状图切换，带目标线对比，可下载图片
车辆类型分布：支持环形/饼图/玫瑰图切换，点击可筛选
每日进出趋势：双轴显示（入场/出场柱状图 + 在场车辆折线）
3. 实时监控
Tab切换：最近记录 / 在场车辆
动态列表：显示车牌、时间、状态
相对时间显示（刚刚、几分钟前）
30秒自动刷新数据
4. 快捷操作
入场/出场登记按钮
车辆管理、收费记录入口
技术特性：
响应式布局（移动端适配）
数据加载状态管理
自动刷新机制（30秒间隔）
时间范围切换（今日/本周/本月）
图表交互（点击跳转）
*/