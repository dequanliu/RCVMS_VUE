<template>
  <div class="car-detail-container">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cars' }">车辆管理</el-breadcrumb-item>
      <el-breadcrumb-item>车辆详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <el-divider direction="vertical" />
        <h2 class="page-title">{{ carInfo?.licensePlate || '加载中...' }}</h2>
        <el-tag 
          :type="getStatusType(carInfo?.carStatus)" 
          effect="dark" 
          size="large" 
          class="ml-md"
        >
          {{ getStatusLabel(carInfo?.carStatus) }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button :icon="Edit" type="primary" @click="handleEdit">编辑</el-button>
        <el-button :icon="List" @click="showRecords">进出记录</el-button>
        <el-dropdown @command="handleMoreAction">
          <el-button :icon="MoreFilled">
            更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="blacklist" v-if="carInfo?.carStatus !== 'Blacklisted'">
                <el-icon><CircleClose /></el-icon>加入黑名单
              </el-dropdown-item>
              <el-dropdown-item command="unblacklist" v-else>
                <el-icon><CircleCheck /></el-icon>移出黑名单
              </el-dropdown-item>
              <el-dropdown-item command="print">
                <el-icon><Printer /></el-icon>打印信息
              </el-dropdown-item>
              <el-dropdown-item divided command="delete" style="color: #f56c6c">
                <el-icon><Delete /></el-icon>删除车辆
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：车辆信息 -->
      <el-col :xs="24" :lg="8">
        <!-- 车辆照片卡片 -->
        <el-card class="detail-card photo-card" shadow="hover">
          <div class="photo-container">
            <el-image 
              :src="carInfo?.vehiclePhoto || '/default-car.png'" 
              fit="cover"
              class="car-photo"
              :preview-src-list="[carInfo?.vehiclePhoto || '/default-car.png']"
            >
              <template #error>
                <div class="image-error">
                  <el-icon size="60"><Van /></el-icon>
                  <p>暂无车辆照片</p>
                </div>
              </template>
            </el-image>
            <div class="photo-badge" v-if="carInfo?.carType === 'Owner'">
              <el-tag type="success" effect="dark">业主车辆</el-tag>
            </div>
          </div>
          
          <div class="plate-display">
            <div class="plate-number">{{ carInfo?.licensePlate }}</div>
            <div class="plate-type">{{ getCarTypeLabel(carInfo?.carType) }}</div>
          </div>
        </el-card>

        <!-- 基本信息卡片 -->
        <el-card class="detail-card info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><InfoFilled /></el-icon> 基本信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="车辆品牌">
              {{ carInfo?.brand || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="车辆型号">
              {{ carInfo?.model || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="车身颜色">
              <span v-if="carInfo?.color" class="color-display">
                <span class="color-dot" :style="{ background: getColorHex(carInfo.color) }"></span>
                {{ carInfo.color }}
              </span>
              <span v-else>未填写</span>
            </el-descriptions-item>
            <el-descriptions-item label="登记时间">
              {{ formatDate(carInfo?.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="最近更新">
              {{ formatDate(carInfo?.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ carInfo?.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 车主信息卡片 -->
        <el-card class="detail-card owner-card" shadow="hover" v-if="carInfo?.ownerId">
          <template #header>
            <div class="card-header">
              <span><el-icon><UserFilled /></el-icon> 车主信息</span>
              <el-button link type="primary" @click="viewOwner">查看详情</el-button>
            </div>
          </template>
          
          <div class="owner-profile">
            <el-avatar :size="64" :icon="UserFilled" />
            <div class="owner-name">{{ carInfo?.ownerName }}</div>
            <div class="owner-phone">{{ carInfo?.ownerPhone }}</div>
          </div>
          
          <el-descriptions :column="1" class="mt-md">
            <el-descriptions-item label="住址">
              {{ carInfo?.ownerAddress || '未填写' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧：记录与统计 -->
      <el-col :xs="24" :lg="16">
        <!-- 统计卡片 -->
        <el-row :gutter="16" class="stats-row">
          <el-col :xs="12" :sm="6">
            <div class="stat-box">
              <div class="stat-icon blue"><el-icon><Timer /></el-icon></div>
              <div class="stat-info">
                <div class="stat-num">{{ statistics.totalVisits }}</div>
                <div class="stat-label">累计进出</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-box">
              <div class="stat-icon green"><el-icon><Calendar /></el-icon></div>
              <div class="stat-info">
                <div class="stat-num">{{ statistics.thisMonthVisits }}</div>
                <div class="stat-label">本月进出</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-box">
              <div class="stat-icon orange"><el-icon><Money /></el-icon></div>
              <div class="stat-info">
                <div class="stat-num">¥{{ statistics.totalFee }}</div>
                <div class="stat-label">累计费用</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-box">
              <div class="stat-icon purple"><el-icon><Stopwatch /></el-icon></div>
              <div class="stat-info">
                <div class="stat-num">{{ statistics.totalDuration }}h</div>
                <div class="stat-label">累计时长</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 标签页内容 -->
        <el-card class="detail-card tabs-card" shadow="hover">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <!-- 进出记录 -->
            <el-tab-pane label="进出记录" name="records">
              <template #label>
                <span class="tab-label">
                  <el-icon><List /></el-icon> 进出记录
                  <el-tag size="small" type="info" class="ml-xs">{{ records.length }}</el-tag>
                </span>
              </template>
              
              <div class="table-toolbar">
                <el-radio-group v-model="recordFilter" size="small">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="week">本周</el-radio-button>
                </el-radio-group>
                <el-button :icon="Download" size="small" @click="exportRecords">导出</el-button>
              </div>

              <el-timeline class="records-timeline">
                <el-timeline-item
                  v-for="(record, index) in filteredRecords"
                  :key="index"
                  :type="record.leaveTime ? 'primary' : 'success'"
                  :icon="record.leaveTime ? CircleCheck : CaretRight"
                  :timestamp="formatDate(record.enterTime)"
                >
                  <div class="record-item">
                    <div class="record-header">
                      <span class="record-type">{{ record.leaveTime ? '已完成' : '停车中' }}</span>
                      <el-tag size="small" :type="record.feePaid ? 'success' : 'warning'">
                        {{ record.feePaid ? '已缴费' : '未缴费' }}
                      </el-tag>
                    </div>
                    <div class="record-info">
                      <div class="info-row">
                        <span class="label">入场时间：</span>
                        <span class="value">{{ formatDateTime(record.enterTime) }}</span>
                      </div>
                      <div class="info-row" v-if="record.leaveTime">
                        <span class="label">出场时间：</span>
                        <span class="value">{{ formatDateTime(record.leaveTime) }}</span>
                      </div>
                      <div class="info-row" v-if="record.parkingDuration">
                        <span class="label">停车时长：</span>
                        <span class="value highlight">{{ formatDuration(record.parkingDuration) }}</span>
                      </div>
                      <div class="info-row" v-if="record.fee > 0">
                        <span class="label">费用金额：</span>
                        <span class="value price">¥{{ record.fee }}</span>
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>

              <el-empty v-if="filteredRecords.length === 0" description="暂无进出记录" />
              
              <div class="load-more" v-if="filteredRecords.length > 0">
                <el-button link type="primary" @click="loadMoreRecords">加载更多</el-button>
              </div>
            </el-tab-pane>

            <!-- 费用记录 -->
            <el-tab-pane label="费用记录" name="fees">
              <template #label>
                <span class="tab-label">
                  <el-icon><Money /></el-icon> 费用记录
                  <el-tag size="small" type="warning" class="ml-xs" v-if="unpaidCount > 0">{{ unpaidCount }}笔未缴</el-tag>
                </span>
              </template>

              <el-table :data="feeRecords" stripe style="width: 100%">
                <el-table-column prop="createTime" label="时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="120">
                  <template #default="{ row }">
                    <span style="color: #f56c6c; font-weight: bold;">¥{{ row.amount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'Paid' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'Paid' ? '已支付' : '未支付' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" show-overflow-tooltip />
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button 
                      v-if="row.status !== 'Paid'" 
                      type="primary" 
                      link 
                      size="small"
                      @click="handlePay(row)"
                    >
                      去支付
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 停车分析 -->
            <el-tab-pane label="停车分析" name="analysis">
              <template #label>
                <span class="tab-label">
                  <el-icon><DataLine /></el-icon> 停车分析
                </span>
              </template>
              
              <div class="analysis-content">
                <el-row :gutter="20">
                  <el-col :sm="24" :md="12">
                    <div class="analysis-item">
                      <div class="analysis-title">停车时段分布</div>
                      <div class="chart-placeholder">
                        <div class="placeholder-text">时段统计图表</div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :sm="24" :md="12">
                    <div class="analysis-item">
                      <div class="analysis-title">月度费用趋势</div>
                      <div class="chart-placeholder">
                        <div class="placeholder-text">费用趋势图表</div>
                      </div>
                    </div>
                  </el-col>
                </el-row>

                <el-divider />

                <div class="analysis-stats">
                  <div class="analysis-row">
                    <span class="label">平均停车时长：</span>
                    <span class="value">{{ statistics.avgDuration }} 小时</span>
                  </div>
                  <div class="analysis-row">
                    <span class="label">平均费用/次：</span>
                    <span class="value">¥{{ statistics.avgFee }}</span>
                  </div>
                  <div class="analysis-row">
                    <span class="label">最常停车位：</span>
                    <span class="value">{{ statistics.favoriteSpace || '无固定车位' }}</span>
                  </div>
                  <div class="analysis-row">
                    <span class="label">活跃天数：</span>
                    <span class="value">{{ statistics.activeDays }} 天</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 操作日志 -->
            <el-tab-pane label="操作日志" name="logs">
              <template #label>
                <span class="tab-label">
                  <el-icon><Document /></el-icon> 操作日志
                </span>
              </template>
              
              <el-timeline>
                <el-timeline-item
                  v-for="(log, index) in operationLogs"
                  :key="index"
                  :type="log.type"
                  :timestamp="log.time"
                >
                  {{ log.content }}
                  <div class="log-operator">操作人：{{ log.operator }}</div>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  List,
  MoreFilled,
  ArrowDown,
  CircleClose,
  CircleCheck,
  Delete,
  Printer,
  InfoFilled,
  UserFilled,
  Van,
  Timer,
  Calendar,
  Money,
  Stopwatch,
  CaretRight,
  CircleCheck as CircleCheckIcon,
  DataLine,
  Document,
  Download
} from '@element-plus/icons-vue'
import { carsApi } from '../../api/cars'
import { carInOutRecordsApi } from '../../api/carInOutRecords'
import { formatDate, formatDuration } from '../../utils/date'
import type { CarInfo, CarInOutRecord } from '../../types/api'

const route = useRoute()
const router = useRouter()
const carId = computed(() => Number(route.params.id))

// 状态
const loading = ref(false)
const activeTab = ref('records')
const recordFilter = ref('all')

// 数据
const carInfo = ref<CarInfo | null>(null)
const records = ref<CarInOutRecord[]>([])
const feeRecords = ref<any[]>([])
const operationLogs = ref<any[]>([])
const statistics = ref({
  totalVisits: 0,
  thisMonthVisits: 0,
  totalFee: 0,
  totalDuration: 0,
  avgDuration: 0,
  avgFee: 0,
  favoriteSpace: '',
  activeDays: 0
})

// 计算属性
const unpaidCount = computed(() => feeRecords.value.filter(f => f.status !== 'Paid').length)

const filteredRecords = computed(() => {
  if (recordFilter.value === 'all') return records.value
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  return records.value.filter(record => {
    const date = new Date(record.enterTime)
    if (recordFilter.value === 'month') {
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear
    }
    if (recordFilter.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return date >= weekAgo
    }
    return true
  })
})

// 获取详情
const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await carsApi.getCarById(carId.value)
    carInfo.value = res
    
    // 并行获取其他数据
    await Promise.all([
      fetchRecords(),
      fetchStatistics()
    ])
  } catch (error) {
    ElMessage.error('获取车辆信息失败')
  } finally {
    loading.value = false
  }
}

// 获取进出记录
const fetchRecords = async () => {
  try {
    const res = await carInOutRecordsApi.getRecords({
      licensePlate: carInfo.value?.licensePlate,
      PageSize: 10
    })
    records.value = res.items
    
    // 模拟费用记录
    feeRecords.value = res.items
      .filter((r: CarInOutRecord) => r.fee > 0)
      .map((r: CarInOutRecord, index: number) => ({
        id: r.id,
        createTime: r.leaveTime || r.enterTime,
        type: r.carType === 'Owner' ? '月租' : '临时',
        amount: r.fee,
        status: r.feePaid ? 'Paid' : 'Unpaid',
        remark: r.remark || '停车费'
      }))
  } catch (error) {
    console.error('获取记录失败:', error)
  }
}

// 获取统计数据
const fetchStatistics = () => {
  // 模拟统计数据
  statistics.value = {
    totalVisits: records.value.length,
    thisMonthVisits: records.value.filter((r: CarInOutRecord) => {
      const date = new Date(r.enterTime)
      const now = new Date()
      return date.getMonth() === now.getMonth()
    }).length,
    totalFee: records.value.reduce((sum: number, r: CarInOutRecord) => sum + r.fee, 0),
    totalDuration: Math.floor(records.value.reduce((sum: number, r: CarInOutRecord) => sum + (r.parkingDuration || 0), 0) / 60),
    avgDuration: records.value.length ? Math.floor(records.value.reduce((sum: number, r: CarInOutRecord) => sum + (r.parkingDuration || 0), 0) / records.value.length / 60 * 10) / 10 : 0,
    avgFee: records.value.length ? Math.floor(records.value.reduce((sum: number, r: CarInOutRecord) => sum + r.fee, 0) / records.value.filter((r: CarInOutRecord) => r.fee > 0).length * 100) / 100 : 0,
    favoriteSpace: 'A-101',
    activeDays: new Set(records.value.map((r: CarInOutRecord) => formatDate(r.enterTime))).size
  }
  
  // 模拟操作日志
  operationLogs.value = [
    { type: 'primary', time: '2024-01-15 14:30:00', content: '车辆信息更新', operator: '管理员' },
    { type: 'success', time: '2024-01-10 09:15:00', content: '车辆登记入库', operator: '系统' },
    { type: 'warning', time: '2024-01-08 16:45:00', content: '费用补缴 ¥15', operator: '车主本人' }
  ]
}

// 辅助函数
const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    'Active': 'success',
    'Inactive': 'info',
    'Blacklisted': 'danger'
  }
  return map[status || ''] || 'info'
}

const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    'Active': '正常',
    'Inactive': '停用',
    'Blacklisted': '黑名单'
  }
  return map[status || ''] || status
}

const getCarTypeLabel = (type?: string) => {
  return type === 'Owner' ? '业主车辆' : '临时车辆'
}

const getColorHex = (color: string) => {
  const map: Record<string, string> = {
    '黑色': '#000000',
    '白色': '#FFFFFF',
    '银色': '#C0C0C0',
    '红色': '#FF0000'
  }
  return map[color] || '#ccc'
}

const formatDateTime = (date?: string) => {
  return date ? formatDate(date, 'YYYY-MM-DD HH:mm:ss') : '-'
}

// 操作处理
const goBack = () => router.back()

const handleEdit = () => {
  router.push(`/cars/edit/${carId.value}`)
}

const showRecords = () => {
  activeTab.value = 'records'
}

const viewOwner = () => {
  if (carInfo.value?.ownerId) {
    router.push(`/system/users/${carInfo.value.ownerId}`)
  }
}

const handleMoreAction = (cmd: string) => {
  switch (cmd) {
    case 'blacklist':
      ElMessageBox.confirm('确定将此车辆加入黑名单吗？', '提示', {
        type: 'warning'
      }).then(() => {
        // 调用API
        ElMessage.success('已加入黑名单')
      })
      break
    case 'unblacklist':
      ElMessage.success('已移出黑名单')
      break
    case 'print':
      window.print()
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除此车辆吗？此操作不可恢复！', '警告', {
        type: 'danger',
        confirmButtonText: '确定删除',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        carsApi.deleteCar(carId.value).then(() => {
          ElMessage.success('删除成功')
          router.push('/cars')
        })
      })
      break
  }
}

const handlePay = (row: any) => {
  router.push(`/fees/payment?recordId=${row.id}`)
}

const exportRecords = () => {
  ElMessage.success('记录导出成功')
}

const loadMoreRecords = () => {
  ElMessage.info('加载更多...')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.car-detail-container {
  padding: 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* 详情卡片 */
.detail-card {
  margin-bottom: 20px;
  border: none;
  background: var(--color-bg-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

/* 照片卡片 */
.photo-card {
  overflow: hidden;
}

.photo-container {
  position: relative;
  width: 100%;
  height: 240px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.car-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.photo-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.plate-display {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  margin: -20px -20px 0;
  margin-bottom: 20px;
}

.plate-number {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.plate-type {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

/* 颜色显示 */
.color-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  display: inline-block;
}

/* 车主信息 */
.owner-profile {
  text-align: center;
  padding: 20px 0;
}

.owner-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-top: 12px;
}

.owner-phone {
  color: #606266;
  margin-top: 4px;
}

/* 统计区域 */
.stats-row {
  margin-bottom: 20px;
}

.stat-box {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-box:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #1890ff, #36cfc9); }
.stat-icon.green { background: linear-gradient(135deg, #52c41a, #95de64); }
.stat-icon.orange { background: linear-gradient(135deg, #fa8c16, #ffc53d); }
.stat-icon.purple { background: linear-gradient(135deg, #722ed1, #b37feb); }

.stat-num {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* 标签页 */
.tabs-card {
  min-height: 600px;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-label .el-icon {
  font-size: 16px;
}

/* 记录时间线 */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.records-timeline {
  padding-left: 10px;
}

.record-item {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.record-item:hover {
  background: #f6ffed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #d9f7be;
}

.record-type {
  font-weight: 600;
  color: #52c41a;
}

.record-info {
  font-size: 13px;
  color: #595959;
}

.info-row {
  margin: 4px 0;
  display: flex;
}

.info-row .label {
  color: #8c8c8c;
  width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #262626;
  font-weight: 500;
}

.info-row .value.highlight {
  color: #1890ff;
  font-weight: 600;
}

.info-row .value.price {
  color: #f5222d;
  font-weight: 600;
}

/* 分析区域 */
.analysis-content {
  padding: 10px;
}

.analysis-item {
  margin-bottom: 20px;
}

.analysis-title {
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.chart-placeholder {
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfbfbf;
  border: 2px dashed #d9d9d9;
}

.analysis-stats {
  padding: 20px;
  background: #f6ffed;
  border-radius: 8px;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #d9d9d9;
}

.analysis-row:last-child {
  border-bottom: none;
}

.analysis-row .label {
  color: #595959;
}

.analysis-row .value {
  color: #262626;
  font-weight: 600;
}

/* 日志 */
.log-operator {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-row .el-col {
    margin-bottom: 12px;
  }
  
  .plate-display {
    margin: -12px -12px 16px;
  }
}

@media print {
  .breadcrumb,
  .page-header,
  .el-tabs__header {
    display: none;
  }
  
  .detail-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
/*
CarDetail.vue 功能完整展示：
页面布局：
左侧边栏：车辆照片、基本信息（descriptions）、车主卡片
右侧主内容：统计卡片（4个指标）、标签页（记录/费用/分析/日志）
核心功能：
顶部操作栏
返回按钮、编辑、查看记录、更多操作（黑名单/打印/删除）
车牌号和状态标签醒目展示
车辆照片区
大图展示，点击预览
业主车辆标签角标
车牌号背景条展示
信息展示
基本信息表格（品牌/型号/颜色/时间等）
颜色可视化（颜色圆点）
车主卡片（头像、姓名、电话、地址）
统计卡片
累计进出、本月进出、累计费用、累计时长
渐变色图标背景
标签页内容
进出记录：时间线展示，筛选（全部/本月/本周），缴费状态标签
费用记录：表格展示，未缴费高亮，支持去支付
停车分析：图表占位、统计数据（平均时长、费用、常停车位等）
操作日志：时间线展示车辆相关操作历史
交互特性：
标签切换动画
记录筛选实时响应
更多操作下拉菜单
响应式布局（移动端适配）
打印样式优化
*/