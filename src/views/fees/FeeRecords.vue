<template>
  <div class="fee-records-container">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>费用管理</el-breadcrumb-item>
      <el-breadcrumb-item>费用记录</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 统计概览 -->
    <el-row :gutter="16" class="stats-overview">
      <el-col :xs="12" :sm="6">
        <div class="stat-item total">
          <div class="stat-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.totalAmount.toFixed(2) }}</div>
            <div class="stat-label">应收总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item received">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.paidAmount.toFixed(2) }}</div>
            <div class="stat-label">已收金额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item pending">
          <div class="stat-icon"><el-icon><Warning /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.unpaidAmount.toFixed(2) }}</div>
            <div class="stat-label">待收金额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item count">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalCount }}</div>
            <div class="stat-label">记录总数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷筛选 -->
    <div class="quick-filters">
      <el-radio-group v-model="quickFilter" size="default" @change="handleQuickFilter">
        <el-radio-button label="all">全部记录</el-radio-button>
        <el-radio-button label="unpaid">
          待缴费
          <el-badge :value="stats.unpaidCount" class="filter-badge" v-if="stats.unpaidCount > 0" />
        </el-radio-button>
        <el-radio-button label="paid">已缴费</el-radio-button>
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="week">本周</el-radio-button>
      </el-radio-group>
      
      <el-button :icon="TrendCharts" type="primary" plain @click="showChart = true">
        收费统计
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <SearchBar
      v-model:model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
      :collapse="true"
      :show-count="3"
      class="mb-md"
    />

    <!-- 操作栏 -->
    <div class="toolbar mb-md">
      <el-button type="primary" :icon="Plus" @click="handleCreate">手动计费</el-button>
      <el-button :icon="Download" @click="handleExport">导出Excel</el-button>
      <el-button :icon="Printer" @click="handlePrint">打印报表</el-button>
      <el-popconfirm
        title="确定要批量标记为已缴费吗？"
        @confirm="handleBatchPay"
        v-if="selectedRows.length > 0"
      >
        <template #reference>
          <el-button type="success" :icon="CircleCheck">
            批量缴费({{ selectedRows.length }})
          </el-button>
        </template>
      </el-popconfirm>
    </div>

    <!-- 数据表格 -->
    <BaseTable
      ref="tableRef"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      show-selection
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <!-- 车牌号列 -->
      <template #licensePlate="{ row }">
        <div class="plate-cell">
          <el-icon class="car-icon"><Van /></el-icon>
          <span class="plate-text">{{ row.licensePlate }}</span>
          <el-tag size="small" v-if="row.carType === 'Owner'" type="success">业</el-tag>
          <el-tag size="small" v-else type="warning">临</el-tag>
        </div>
      </template>

      <!-- 停车时长列 -->
      <template #duration="{ row }">
        <span class="duration-text">{{ formatDuration(row.parkingDuration) }}</span>
      </template>

      <!-- 费用金额列 -->
      <template #feeAmount="{ row }">
        <div class="fee-cell">
          <span class="fee-amount">¥{{ row.feeAmount.toFixed(2) }}</span>
          <span class="fee-paid" v-if="row.paidAmount">已收: ¥{{ row.paidAmount.toFixed(2) }}</span>
        </div>
      </template>

      <!-- 支付状态列 -->
      <template #paymentStatus="{ row }">
        <div class="status-wrapper">
          <el-tag 
            :type="getStatusType(row.paymentStatus)" 
            effect="dark"
            size="small"
            class="status-tag"
          >
            {{ getStatusLabel(row.paymentStatus) }}
          </el-tag>
          <el-tag 
            v-if="row.paymentMethod" 
            type="info" 
            size="small"
            class="method-tag"
          >
            {{ getMethodLabel(row.paymentMethod) }}
          </el-tag>
        </div>
      </template>

      <!-- 时间列 -->
      <template #timeRange="{ row }">
        <div class="time-cell">
          <div class="time-row">
            <el-icon><Timer /></el-icon>
            <span>入：{{ formatDateTime(row.enterTime) }}</span>
          </div>
          <div class="time-row" v-if="row.leaveTime">
            <el-icon><CircleCheck /></el-icon>
            <span>出：{{ formatDateTime(row.leaveTime) }}</span>
          </div>
        </div>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <el-button 
          v-if="row.paymentStatus !== 'Paid'" 
          type="primary" 
          link 
          :icon="Wallet"
          @click="handlePay(row)"
        >
          收费
        </el-button>
        <el-button link :icon="View" @click="handleView(row)">详情</el-button>
        <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
          <el-button link type="info">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="print"><el-icon><Printer /></el-icon>打印小票</el-dropdown-item>
              <el-dropdown-item command="waive" v-if="row.paymentStatus !== 'Paid'">
                <el-icon><CircleClose /></el-icon>减免费用
              </el-dropdown-item>
              <el-dropdown-item command="refund" v-if="row.paymentStatus === 'Paid'" divided>
                <el-icon><RefreshLeft /></el-icon>退款
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </BaseTable>

    <!-- 收费弹窗 -->
    <BaseDialog
      v-model="payDialogVisible"
      title="停车收费"
      width="500px"
      :confirm-loading="payLoading"
      @confirm="confirmPay"
      @cancel="payDialogVisible = false"
    >
      <div class="pay-dialog-content" v-if="currentRow">
        <div class="pay-info">
          <div class="info-row">
            <span class="label">车牌号：</span>
            <span class="value highlight">{{ currentRow.licensePlate }}</span>
          </div>
          <div class="info-row">
            <span class="label">入场时间：</span>
            <span class="value">{{ formatDateTime(currentRow.enterTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">出场时间：</span>
            <span class="value">{{ formatDateTime(currentRow.leaveTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">停车时长：</span>
            <span class="value highlight">{{ formatDuration(currentRow.parkingDuration) }}</span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="pay-form">
          <div class="amount-display">
            <span class="amount-label">应收金额</span>
            <span class="amount-value">¥{{ currentRow.feeAmount.toFixed(2) }}</span>
          </div>
          
          <el-form :model="payForm" label-width="100px">
            <el-form-item label="实收金额">
              <el-input-number 
                v-model="payForm.amount" 
                :min="0" 
                :max="9999"
                :precision="2"
                :controls="false"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
            
            <el-form-item label="支付方式">
              <el-radio-group v-model="payForm.method">
                <el-radio-button label="Cash">现金</el-radio-button>
                <el-radio-button label="WeChat">微信</el-radio-button>
                <el-radio-button label="Alipay">支付宝</el-radio-button>
                <el-radio-button label="Card">刷卡</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="发票号码" v-if="payForm.method === 'Cash'">
              <el-input v-model="payForm.invoiceNo" placeholder="选填" />
            </el-form-item>
            
            <el-form-item label="备注">
              <el-input 
                v-model="payForm.remark" 
                type="textarea" 
                :rows="2" 
                placeholder="收费备注（选填）"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </BaseDialog>

    <!-- 统计图表弹窗 -->
    <BaseDialog
      v-model="showChart"
      title="收费统计分析"
      width="800px"
      :show-footer="false"
    >
      <div class="chart-container">
        <RevenueChart 
          :data="chartData" 
          height="400"
          chart-type="mixed"
        />
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Money,
  CircleCheck,
  Warning,
  Document,
  TrendCharts,
  Plus,
  Download,
  Printer,
  Van,
  Wallet,
  View,
  MoreFilled,
  Timer,
  CircleClose,
  RefreshLeft
} from '@element-plus/icons-vue'
import SearchBar from '../../components/common/SearchBar.vue'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseDialog from '../../components/common/BaseDialog.vue'
import RevenueChart from '../../components/charts/RevenueChart.vue'
import { feeRecordsApi } from '../../api/feeRecords'
import { formatDate, formatDuration } from '../../utils/date'
import type { FeeRecord } from '../../types/api'

const router = useRouter()

// 状态
const loading = ref(false)
const payLoading = ref(false)
const payDialogVisible = ref(false)
const showChart = ref(false)
const quickFilter = ref('all')
const tableRef = ref<InstanceType<typeof BaseTable>>()

// 统计数据
const stats = reactive({
  totalAmount: 0,
  paidAmount: 0,
  unpaidAmount: 0,
  totalCount: 0,
  unpaidCount: 0
})

// 搜索表单
const searchForm = reactive({
  licensePlate: '',
  paymentStatus: '',
  startDate: '',
  endDate: '',
  minAmount: undefined,
  maxAmount: undefined
})

// 搜索配置
const searchItems = [
  { prop: 'licensePlate', label: '车牌号', placeholder: '模糊搜索' },
  { 
    prop: 'paymentStatus', 
    label: '支付状态', 
    type: 'select',
    options: [
      { label: '未支付', value: 'Unpaid' },
      { label: '已支付', value: 'Paid' },
      { label: '部分支付', value: 'Partial' },
      { label: '已退款', value: 'Refunded' }
    ],
    clearable: true
  },
  { 
    prop: 'dateRange', 
    label: '时间范围', 
    type: 'date',
    dateType: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  },
  { 
    prop: 'amountRange', 
    label: '金额范围', 
    type: 'number-range',
    startPlaceholder: '最小金额',
    endPlaceholder: '最大金额'
  }
]

// 表格列
const columns = [
  { prop: 'licensePlate', label: '车牌号', width: 150, slot: true },
  { prop: 'timeRange', label: '停车时间', width: 200, slot: true },
  { prop: 'duration', label: '停车时长', width: 120, slot: true },
  { prop: 'feeAmount', label: '费用金额', width: 140, slot: true },
  { prop: 'paymentStatus', label: '支付状态', width: 140, slot: true },
  { prop: 'createTime', label: '创建时间', width: 160, formatter: (val: string) => formatDate(val) }
]

// 表格数据
const tableData = ref<FeeRecord[]>([])
const selectedRows = ref<FeeRecord[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 当前操作行
const currentRow = ref<FeeRecord | null>(null)

// 收费表单
const payForm = reactive({
  amount: 0,
  method: 'Cash',
  invoiceNo: '',
  remark: ''
})

// 图表数据
const chartData = ref([
  { date: '2024-01-01', revenue: 1200, target: 1000 },
  { date: '2024-01-02', revenue: 1500, target: 1200 },
  { date: '2024-01-03', revenue: 800, target: 1000 },
  { date: '2024-01-04', revenue: 2000, target: 1500 },
  { date: '2024-01-05', revenue: 1800, target: 1600 }
])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await feeRecordsApi.getFeeRecords({
      PageNumber: pagination.current,
      PageSize: pagination.pageSize,
      Search: searchForm.licensePlate,
      paymentStatus: searchForm.paymentStatus,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    })
    
    tableData.value = res.items
    pagination.total = res.totalCount
    
    // 更新统计
    updateStats(res.items)
  } catch (error) {
    console.error('获取费用记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计
const updateStats = (data: FeeRecord[]) => {
  stats.totalCount = pagination.total
  stats.totalAmount = data.reduce((sum, item) => sum + item.feeAmount, 0)
  stats.paidAmount = data.reduce((sum, item) => sum + (item.paidAmount || 0), 0)
  stats.unpaidAmount = stats.totalAmount - stats.paidAmount
  stats.unpaidCount = data.filter(item => item.paymentStatus !== 'Paid').length
}

// 快捷筛选
const handleQuickFilter = (val: string) => {
  if (val === 'all') {
    searchForm.paymentStatus = ''
  } else if (val === 'unpaid') {
    searchForm.paymentStatus = 'Unpaid'
  } else if (val === 'paid') {
    searchForm.paymentStatus = 'Paid'
  } else if (val === 'today') {
    const today = new Date().toISOString().split('T')[0]
    searchForm.startDate = today
    searchForm.endDate = today
  } else if (val === 'week') {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    searchForm.startDate = start.toISOString().split('T')[0]
    searchForm.endDate = end.toISOString().split('T')[0]
  }
  handleSearch()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    (searchForm as any)[key] = undefined
  })
  quickFilter.value = 'all'
  handleSearch()
}

// 分页
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page
  pagination.pageSize = pageSize
  fetchData()
}

// 选择变化
const handleSelectionChange = (rows: FeeRecord[]) => {
  selectedRows.value = rows
}

// 辅助函数
const getStatusType = (status: string): any => {
  const map: Record<string, any> = {
    'Paid': 'success',
    'Unpaid': 'danger',
    'Partial': 'warning',
    'Refunded': 'info'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'Paid': '已支付',
    'Unpaid': '未支付',
    'Partial': '部分支付',
    'Refunded': '已退款'
  }
  return map[status] || status
}

const getMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    'Cash': '现金',
    'WeChat': '微信',
    'Alipay': '支付宝',
    'Card': '刷卡',
    'Other': '其他'
  }
  return map[method] || method
}

const formatDateTime = (date?: string) => {
  return date ? formatDate(date, 'MM-DD HH:mm') : '-'
}

// 操作处理
const handleCreate = () => {
  router.push('/fees/payment')
}

const handleView = (row: FeeRecord) => {
  ElMessageBox.alert(`
    <div style="line-height: 2">
      <p><strong>车牌号：</strong>${row.licensePlate}</p>
      <p><strong>入场时间：</strong>${formatDate(row.enterTime)}</p>
      <p><strong>出场时间：</strong>${row.leaveTime ? formatDate(row.leaveTime) : '未出场'}</p>
      <p><strong>停车时长：</strong>${formatDuration(row.parkingDuration)}</p>
      <p><strong>应收金额：</strong>¥${row.feeAmount.toFixed(2)}</p>
      <p><strong>已付金额：</strong>¥${(row.paidAmount || 0).toFixed(2)}</p>
      <p><strong>支付状态：</strong>${getStatusLabel(row.paymentStatus)}</p>
      ${row.paymentMethod ? `<p><strong>支付方式：</strong>${getMethodLabel(row.paymentMethod)}</p>` : ''}
      ${row.transactionId ? `<p><strong>交易单号：</strong>${row.transactionId}</p>` : ''}
    </div>
  `, '费用详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
}

const handlePay = (row: FeeRecord) => {
  currentRow.value = row
  payForm.amount = row.feeAmount - (row.paidAmount || 0)
  payForm.method = 'Cash'
  payForm.invoiceNo = ''
  payForm.remark = ''
  payDialogVisible.value = true
}

const confirmPay = async () => {
  if (!currentRow.value) return
  
  payLoading.value = true
  try {
    await feeRecordsApi.pay({
      RecordId: currentRow.value.id,
      PaymentMethod: payForm.method,
      CustomAmount: payForm.amount,
      InvoiceNumber: payForm.invoiceNo,
      Remark: payForm.remark
    })
    
    ElMessage.success('收费成功')
    payDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('收费失败')
  } finally {
    payLoading.value = false
  }
}

const handleMore = (cmd: string, row: FeeRecord) => {
  switch (cmd) {
    case 'print':
      ElMessage.success('打印小票成功')
      break
    case 'waive':
      ElMessageBox.confirm('确定要减免此笔费用吗？', '提示', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('费用已减免')
        fetchData()
      })
      break
    case 'refund':
      ElMessageBox.prompt('请输入退款金额', '退款', {
        confirmButtonText: '确认退款',
        cancelButtonText: '取消',
        inputPattern: /^\d+(\.\d{1,2})?$/,
        inputErrorMessage: '请输入正确的金额'
      }).then(({ value }) => {
        ElMessage.success(`退款 ¥${value} 成功`)
        fetchData()
      })
      break
  }
}

const handleBatchPay = async () => {
  try {
    await Promise.all(selectedRows.value.map(row => 
      feeRecordsApi.pay({
        RecordId: row.id,
        PaymentMethod: 'Cash'
      })
    ))
    ElMessage.success('批量缴费成功')
    fetchData()
  } catch (error) {
    ElMessage.error('批量缴费失败')
  }
}

const handleExport = () => {
  // 导出逻辑
  const headers = ['车牌号', '入场时间', '出场时间', '停车时长(分钟)', '费用金额', '支付状态', '支付方式']
  const rows = selectedRows.value.length > 0 ? selectedRows.value : tableData.value
  const csv = [
    headers.join(','),
    ...rows.map(row => [
      row.licensePlate,
      row.enterTime,
      row.leaveTime || '',
      row.parkingDuration,
      row.feeAmount,
      getStatusLabel(row.paymentStatus),
      row.paymentMethod || ''
    ].join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `费用记录_${formatDate(new Date())}.csv`
  link.click()
  
  ElMessage.success('导出成功')
}

const handlePrint = () => {
  window.print()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.fee-records-container {
  padding: 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

/* 统计概览 */
.stats-overview {
  margin-bottom: 20px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-item.total .stat-icon { background: linear-gradient(135deg, #409eff, #36cfc9); }
.stat-item.received .stat-icon { background: linear-gradient(135deg, #52c41a, #95de64); }
.stat-item.pending .stat-icon { background: linear-gradient(135deg, #fa8c16, #ffc53d); }
.stat-item.count .stat-icon { background: linear-gradient(135deg, #722ed1, #b37feb); }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #262626;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 快捷筛选 */
.quick-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.filter-badge :deep(.el-badge__content) {
  position: relative;
  top: -8px;
  right: -4px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 表格自定义 */
.plate-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.car-icon {
  color: #409eff;
  font-size: 16px;
}

.plate-text {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.duration-text {
  color: #595959;
  font-size: 13px;
}

.fee-cell {
  display: flex;
  flex-direction: column;
}

.fee-amount {
  font-size: 15px;
  font-weight: bold;
  color: #f5222d;
}

.fee-paid {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.status-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-tag {
  width: fit-content;
}

.method-tag {
  width: fit-content;
  font-size: 11px;
}

.time-cell {
  font-size: 13px;
  color: #595959;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 3px 0;
}

.time-row .el-icon {
  font-size: 12px;
  color: #8c8c8c;
}

/* 收费弹窗 */
.pay-dialog-content {
  padding: 10px 0;
}

.pay-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.info-row .label {
  color: #595959;
}

.info-row .value {
  color: #262626;
  font-weight: 500;
}

.info-row .value.highlight {
  color: #1890ff;
  font-weight: bold;
}

.amount-display {
  text-align: center;
  padding: 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  margin-bottom: 20px;
}

.amount-label {
  display: block;
  color: #595959;
  font-size: 14px;
  margin-bottom: 8px;
}

.amount-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #cf1322;
}

/* 图表容器 */
.chart-container {
  padding: 20px;
}

/* 打印样式 */
@media print {
  .breadcrumb,
  .stats-overview,
  .quick-filters,
  .toolbar,
  .el-pagination {
    display: none;
  }
}
</style>
/**
财务概览：
4个核心指标卡片（应收/已收/待收/记录数），带渐变色图标
快捷筛选标签（全部/待缴费/已缴费/今日/本周），带未缴数量角标
高级搜索：
车牌号模糊搜索
支付状态下拉
时间范围选择
金额范围筛选（自定义 number-range 类型）
表格功能：
车牌号展示（带车辆类型标签）
停车时间范围（入场/出场图标区分）
费用金额（应收/已收双行显示）
支付状态（彩色标签+支付方式）
批量选择缴费
收费弹窗：
停车信息摘要（绿色背景高亮）
应收金额大字体展示（红色警示）
实收金额可编辑（支持部分收款）
支付方式单选（现金/微信/支付宝/刷卡）
发票号码和备注
扩展操作：
打印小票
费用减免
退款处理
导出CSV/打印报表
收费统计图表弹窗
*/