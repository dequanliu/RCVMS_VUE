<template>
  <div class="car-list-container">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>车辆管理</el-breadcrumb-item>
      <el-breadcrumb-item>车辆列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">车辆总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon owner">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.owner }}</div>
              <div class="stat-label">业主车辆</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon temp">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.temporary }}</div>
              <div class="stat-label">临时车辆</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <SearchBar
      v-model:model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
      :collapse="false"
      class="mb-md"
    />

    <!-- 操作栏 -->
    <div class="toolbar mb-md">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增车辆</el-button>
      <el-button :icon="Upload" @click="handleImport">批量导入</el-button>
      <el-button :icon="Download" @click="handleExport">导出数据</el-button>
      <el-popconfirm
        title="确定要删除选中的车辆吗？"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="handleBatchDelete"
        v-if="selectedRows.length > 0"
      >
        <template #reference>
          <el-button type="danger" :icon="Delete">批量删除({{ selectedRows.length }})</el-button>
        </template>
      </el-popconfirm>
    </div>

    <!-- 车辆表格 -->
    <BaseTable
      ref="tableRef"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      show-selection
      show-index
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @view="handleView"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <!-- 车牌号列自定义 -->
      <template #licensePlate="{ row }">
        <div class="plate-wrapper">
          <el-icon class="car-icon"><Van /></el-icon>
          <span class="plate-text">{{ row.licensePlate }}</span>
          <el-tag size="small" v-if="row.isBlacklisted" type="danger" effect="dark" class="black-tag">黑</el-tag>
        </div>
      </template>

      <!-- 车辆类型列 -->
      <template #carType="{ row }">
        <el-tag :type="getCarTypeType(row.carType)" effect="light">
          {{ getCarTypeLabel(row.carType) }}
        </el-tag>
      </template>

      <!-- 状态列 -->
      <template #carStatus="{ row }">
        <div class="status-wrapper">
          <span class="status-dot" :class="row.carStatus.toLowerCase()"></span>
          <span>{{ getStatusLabel(row.carStatus) }}</span>
        </div>
      </template>

      <!-- 车主列 -->
      <template #ownerName="{ row }">
        <div class="owner-wrapper">
          <el-avatar :size="24" :icon="UserFilled" v-if="row.ownerName" />
          <span class="ml-sm">{{ row.ownerName || '未绑定' }}</span>
        </div>
      </template>

      <!-- 注册时间列 -->
      <template #createdAt="{ row }">
        <el-tooltip :content="row.createdAt" placement="top">
          <span>{{ formatDate(row.createdAt, 'YYYY-MM-DD') }}</span>
        </el-tooltip>
      </template>

      <!-- 操作列扩展 -->
      <template #action="{ row }">
        <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
        <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
        <el-dropdown trigger="click" @command="(cmd) => handleMoreAction(cmd, row)">
          <el-button link type="primary">
            更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="records">进出记录</el-dropdown-item>
              <el-dropdown-item command="blacklist" v-if="row.carStatus !== 'Blacklisted'">加入黑名单</el-dropdown-item>
              <el-dropdown-item command="unblacklist" v-else>移出黑名单</el-dropdown-item>
              <el-dropdown-item command="delete" divided style="color: #f56c6c">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </BaseTable>

    <!-- 新增/编辑弹窗 -->
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :confirm-loading="saveLoading"
      @confirm="handleSave"
      @cancel="dialogVisible = false"
    >
      <BaseForm
        ref="formRef"
        :model="form"
        :fields="formFields"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 自定义车牌号输入（带验证） -->
        <template #licensePlate="{ value }">
          <el-input
            v-model="form.LicensePlate"
            placeholder="请输入车牌号"
            maxlength="8"
            show-word-limit
            :disabled="isEdit"
          >
            <template #append>
              <el-button @click="checkPlate">验证</el-button>
            </template>
          </el-input>
          <div class="form-tip">格式示例：京A12345、沪AD12345（新能源）</div>
        </template>
      </BaseForm>
    </BaseDialog>

    <!-- 导入弹窗 -->
    <BaseDialog
      v-model="importVisible"
      title="批量导入车辆"
      width="500px"
      @confirm="handleImportConfirm"
    >
      <el-upload
        class="upload-area"
        drag
        action="/api/cars/import"
        :headers="uploadHeaders"
        accept=".xlsx,.xls,.csv"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx, .xls, .csv 格式，<el-button link type="primary" @click.stop="downloadTemplate">下载模板</el-button>
          </div>
        </template>
      </el-upload>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  View,
  Delete,
  Download,
  Upload,
  Van,
  User,
  UserFilled,
  Timer,
  ArrowDown,
  UploadFilled
} from '@element-plus/icons-vue'
import SearchBar from '../../components/common/SearchBar.vue'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseDialog from '../../components/common/BaseDialog.vue'
import BaseForm from '../../components/common/BaseForm.vue'
import { carsApi } from '../../api/cars'
import { formatDate } from '../../utils/date'
import { validateLicensePlate } from '../../utils/validate'
import type { TableColumn } from '../../components/common/BaseTable.vue'
import type { FormField } from '../../components/common/BaseForm.vue'
import type { CarInfo, CreateCarDto, UpdateCarDto } from '../../types/api'
import { CarTypeOptions, CarStatusOptions } from '../../types/car'

const router = useRouter()
const tableRef = ref<InstanceType<typeof BaseTable>>()
const formRef = ref<InstanceType<typeof BaseForm>>()

// 搜索表单
const searchForm = reactive({
  licensePlate: '',
  carType: '',
  status: '',
  ownerName: ''
})

// 搜索配置
const searchItems = [
  { prop: 'licensePlate', label: '车牌号', placeholder: '模糊搜索车牌号' },
  { 
    prop: 'carType', 
    label: '车辆类型', 
    type: 'select', 
    options: CarTypeOptions,
    clearable: true
  },
  { 
    prop: 'status', 
    label: '状态', 
    type: 'select', 
    options: CarStatusOptions,
    clearable: true
  },
  { prop: 'ownerName', label: '车主姓名', placeholder: '搜索车主' }
]

// 表格列配置
const columns = ref<TableColumn[]>([
  { prop: 'licensePlate', label: '车牌号', width: 140, slot: true },
  { prop: 'carType', label: '类型', width: 100, slot: true },
  { prop: 'carStatus', label: '状态', width: 100, slot: true },
  { prop: 'ownerName', label: '车主', width: 120, slot: true },
  { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
  { prop: 'createdAt', label: '注册时间', width: 120, slot: true }
])

// 数据状态
const loading = ref(false)
const tableData = ref<CarInfo[]>([])
const selectedRows = ref<CarInfo[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 统计
const stats = reactive({
  total: 0,
  owner: 0,
  temporary: 0
})

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增车辆')
const saveLoading = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

// 表单
const form = reactive<CreateCarDto & { Id?: number }>({
  LicensePlate: '',
  CarType: '',
  OwnerId: undefined,
  Remark: ''
})

// 表单字段
const formFields = ref<FormField[]>([
  { 
    prop: 'LicensePlate', 
    label: '车牌号', 
    slot: true,
    rules: [{ required: true, message: '请输入车牌号', trigger: 'blur' }]
  },
  { 
    prop: 'CarType', 
    label: '车辆类型', 
    type: 'select',
    options: CarTypeOptions,
    rules: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
  },
  { 
    prop: 'OwnerId', 
    label: '绑定车主', 
    type: 'select',
    options: [], // 可以从用户API加载
    props: { filterable: true, clearable: true, placeholder: '选择车主（可选）' }
  },
  { 
    prop: 'Remark', 
    label: '备注', 
    type: 'textarea',
    rows: 3,
    maxlength: 200,
    showWordLimit: true
  }
])

// 表单验证规则
const formRules = {
  LicensePlate: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (!validateLicensePlate(value)) {
          callback(new Error('请输入正确的车牌号格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  CarType: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
}

// 导入相关
const importVisible = ref(false)
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('rcvms_token')
  return { Authorization: `Bearer ${token}` }
})

// 获取车辆类型标签
const getCarTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'Owner': '业主车',
    'Temporary': '临时车'
  }
  return map[type] || type
}

const getCarTypeType = (type: string): any => {
  const map: Record<string, any> = {
    'Owner': 'success',
    'Temporary': 'warning'
  }
  return map[type] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'Active': '正常',
    'Inactive': '停用',
    'Blacklisted': '黑名单'
  }
  return map[status] || status
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await carsApi.getCars({
      PageNumber: pagination.current,
      PageSize: pagination.pageSize,
      Search: searchForm.licensePlate || searchForm.ownerName,
      ...searchForm
    })
    tableData.value = res.items
    pagination.total = res.totalCount
    
    // 更新统计
    stats.total = res.totalCount
    stats.owner = res.items.filter(i => i.carType === 'Owner').length
    stats.temporary = res.items.filter(i => i.carType === 'Temporary').length
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    (searchForm as any)[key] = ''
  })
  handleSearch()
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page
  pagination.pageSize = pageSize
  fetchData()
}

// 选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增车辆'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: CarInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑车辆'
  currentId.value = row.id
  Object.assign(form, {
    LicensePlate: row.licensePlate,
    CarType: row.carType,
    OwnerId: row.ownerId,
    Remark: row.remark
  })
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: CarInfo) => {
  router.push(`/cars/${row.id}`)
}

// 删除
const handleDelete = async (row: CarInfo) => {
  try {
    await carsApi.deleteCar(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await Promise.all(selectedRows.value.map(row => carsApi.deleteCar(row.id)))
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    fetchData()
  } catch (error) {
    ElMessage.error('批量删除失败')
  }
}

// 更多操作
const handleMoreAction = (cmd: string, row: CarInfo) => {
  switch (cmd) {
    case 'records':
      router.push(`/cars/${row.id}/records`)
      break
    case 'blacklist':
      handleBlacklist(row, true)
      break
    case 'unblacklist':
      handleBlacklist(row, false)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 加入/移出黑名单
const handleBlacklist = async (row: CarInfo, isBlack: boolean) => {
  try {
    await carsApi.updateCarStatus(row.id, isBlack ? 'Blacklisted' : 'Active')
    ElMessage.success(isBlack ? '已加入黑名单' : '已移出黑名单')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  saveLoading.value = true
  try {
    if (isEdit.value && currentId.value) {
      await carsApi.updateCar(currentId.value, {
        CarStatus: form.carStatus,
        Remark: form.Remark
      })
      ElMessage.success('更新成功')
    } else {
      await carsApi.createCar({
        LicensePlate: form.LicensePlate,
        CarType: form.CarType,
        OwnerId: form.OwnerId,
        Remark: form.Remark
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.LicensePlate = ''
  form.CarType = ''
  form.OwnerId = undefined
  form.Remark = ''
  currentId.value = null
  formRef.value?.resetFields()
}

// 验证车牌
const checkPlate = () => {
  if (!form.LicensePlate) {
    ElMessage.warning('请输入车牌号')
    return
  }
  if (validateLicensePlate(form.LicensePlate)) {
    ElMessage.success('车牌号格式正确')
  } else {
    ElMessage.error('车牌号格式不正确')
  }
}

// 导出
const handleExport = () => {
  // 简单的 CSV 导出示例
  const headers = ['车牌号', '车辆类型', '状态', '车主', '注册时间']
  const rows = selectedRows.value.length > 0 ? selectedRows.value : tableData.value
  const csvContent = [
    headers.join(','),
    ...rows.map(row => [
      row.licensePlate,
      row.carType === 'Owner' ? '业主车' : '临时车',
      getStatusLabel(row.carStatus),
      row.ownerName || '未绑定',
      formatDate(row.createdAt)
    ].join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `车辆列表_${formatDate(new Date())}.csv`
  link.click()
  ElMessage.success('导出成功')
}

// 导入
const handleImport = () => {
  importVisible.value = true
}

const handleImportConfirm = () => {
  importVisible.value = false
  fetchData()
}

const handleUploadSuccess = () => {
  ElMessage.success('导入成功')
  importVisible.value = false
  fetchData()
}

const handleUploadError = () => {
  ElMessage.error('导入失败')
}

const downloadTemplate = () => {
  const template = '车牌号,车辆类型(Owner/Temporary),车主ID(可选),备注\n京A12345,Owner,,业主车辆\n沪AD67890,Temporary,,临时访客'
  const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '车辆导入模板.csv'
  link.click()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.car-list-container {
  padding: 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-icon.total {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.stat-icon.owner {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-icon.temp {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 表格自定义样式 */
.plate-wrapper {
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
  font-size: 14px;
  color: #303133;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.black-tag {
  margin-left: 4px;
}

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.active {
  background-color: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.status-dot.inactive {
  background-color: #909399;
}

.status-dot.blacklisted {
  background-color: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.owner-wrapper {
  display: flex;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.upload-area {
  text-align: center;
  padding: 40px;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}
</style>
/*
核心功能：
统计卡片：展示车辆总数、业主车数量、临时车数量
搜索栏：支持车牌号模糊搜索、车辆类型/状态筛选、车主搜索
数据表格：
自定义车牌号显示（带图标和黑名单标记）
车辆类型标签（业主车绿色/临时车橙色）
状态指示器（带颜色小圆点）
车主头像+姓名显示
操作下拉菜单（查看记录、黑名单、删除）
批量操作：多选后批量删除、导出选中数据
表单弹窗：新增/编辑车辆，车牌号格式验证
数据导入：支持 Excel/CSV 批量导入
技术亮点：
完全使用 BaseTable、SearchBar、BaseDialog、BaseForm 组件
自定义列插槽展示复杂数据
表单验证与 API 集成
响应式布局适配移动端
面包屑导航、加载状态、空数据处理

*/