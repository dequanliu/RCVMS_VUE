<template>
  <div class="enter-record-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <el-divider direction="vertical" />
        <h2>车辆入场登记</h2>
      </div>
      <div class="header-right">
        <el-button :icon="VideoCamera" type="primary" @click="openCamera">
          摄像头识别
        </el-button>
        <el-button :icon="Manual" @click="manualInput = !manualInput">
          手动输入
        </el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 左侧：入场登记 -->
      <el-col :xs="24" :lg="14">
        <el-card class="entry-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><Right /></el-icon> 入场信息录入</span>
              <el-tag type="success" effect="dark" v-if="entrySuccess">已入场</el-tag>
            </div>
          </template>

          <!-- 车牌识别区域 -->
          <div class="plate-recognition">
            <div class="camera-view" :class="{ active: cameraActive }">
              <div class="camera-placeholder" v-if="!cameraActive && !capturedPlate">
                <el-icon size="64" color="#dcdfe6"><VideoCamera /></el-icon>
                <p>点击右上角"摄像头识别"按钮</p>
                <p class="sub-text">或开启摄像头自动识别车牌</p>
              </div>
              
              <div class="camera-active" v-if="cameraActive">
                <div class="scan-line"></div>
                <div class="scan-frame">
                  <div class="corner top-left"></div>
                  <div class="corner top-right"></div>
                  <div class="corner bottom-left"></div>
                  <div class="corner bottom-right"></div>
                </div>
                <p class="scan-text">正在识别车牌...</p>
              </div>

              <div class="plate-result" v-if="capturedPlate && !cameraActive">
                <div class="plate-image">
                  <img :src="capturedImage || '/default-plate.png'" alt="车牌">
                </div>
                <div class="plate-number-large">{{ capturedPlate }}</div>
                <div class="plate-confidence">置信度: 98.5%</div>
              </div>
            </div>

            <!-- 快速操作按钮 -->
            <div class="quick-actions" v-if="capturedPlate">
              <el-button type="success" :icon="Check" @click="confirmPlate">确认识别</el-button>
              <el-button :icon="RefreshRight" @click="retake">重新拍摄</el-button>
            </div>
          </div>

          <!-- 手动输入表单 -->
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            class="entry-form"
            v-show="manualInput || capturedPlate"
          >
            <el-form-item label="车牌号" prop="LicensePlate">
              <el-input
                v-model="form.LicensePlate"
                placeholder="请输入车牌号"
                maxlength="8"
                class="plate-input"
                :disabled="entrySuccess"
              >
                <template #prefix>
                  <el-icon><Postcard /></el-icon>
                </template>
                <template #append>
                  <el-button :icon="Search" @click="queryCarInfo">查询</el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 车辆信息展示 -->
            <div class="car-info-panel" v-if="carInfo">
              <div class="info-header">
                <el-tag :type="carInfo.carType === 'Owner' ? 'success' : 'warning'" size="large">
                  {{ carInfo.carType === 'Owner' ? '业主车辆' : '临时车辆' }}
                </el-tag>
                <span class="owner-name" v-if="carInfo.ownerName">
                  <el-icon><User /></el-icon> {{ carInfo.ownerName }}
                </span>
              </div>
              
              <el-alert
                v-if="carInfo.carStatus === 'Blacklisted'"
                title="警告：该车辆处于黑名单状态"
                type="error"
                :closable="false"
                show-icon
                class="blacklist-alert"
              />
              
              <el-alert
                v-else-if="carInfo.carType === 'Owner'"
                title="业主车辆，允许通行"
                type="success"
                :closable="false"
                show-icon
              />
            </div>

            <!-- 入场通道选择 -->
            <el-form-item label="入场通道" prop="EntryGate">
              <el-radio-group v-model="form.EntryGate" size="large">
                <el-radio-button 
                  v-for="gate in gateOptions" 
                  :key="gate.value" 
                  :label="gate.value"
                >
                  <el-icon><OfficeBuilding /></el-icon>
                  {{ gate.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 入场时间 -->
            <el-form-item label="入场时间" prop="EnterTime">
              <el-date-picker
                v-model="form.EnterTime"
                type="datetime"
                placeholder="选择入场时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="entrySuccess"
              />
            </el-form-item>

            <!-- 备注 -->
            <el-form-item label="备注">
              <el-input
                v-model="form.Remark"
                type="textarea"
                :rows="2"
                placeholder="特殊情况说明..."
                maxlength="200"
                show-word-limit
                :disabled="entrySuccess"
              />
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item v-if="!entrySuccess">
              <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit" class="submit-btn">
                <el-icon><Check /></el-icon>
                确认入场
              </el-button>
              <el-button size="large" @click="resetForm">重置</el-button>
            </el-form-item>

            <!-- 成功状态 -->
            <div v-else class="success-panel">
              <el-result
                icon="success"
                title="入场登记成功"
                :sub-title="`入场时间：${formatDateTime(form.EnterTime)}`"
              >
                <template #extra>
                  <el-button type="primary" @click="printTicket">打印小票</el-button>
                  <el-button @click="nextEntry">下一辆</el-button>
                </template>
              </el-result>
            </div>
          </el-form>
        </el-card>

        <!-- 最近入场记录 -->
        <el-card class="recent-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><Clock /></el-icon> 最近入场</span>
              <el-button link type="primary" @click="refreshRecent">刷新</el-button>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in recentEntries"
              :key="index"
              :type="item.carType === 'Owner' ? 'success' : 'primary'"
              :timestamp="formatTime(item.enterTime)"
            >
              <div class="timeline-content">
                <div class="timeline-plate">{{ item.licensePlate }}</div>
                <div class="timeline-gate">{{ item.entryGate }}</div>
                <el-tag :type="item.carType === 'Owner' ? 'success' : 'info'" size="small">
                  {{ item.carType === 'Owner' ? '业主' : '临时' }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>

          <el-empty v-if="recentEntries.length === 0" description="暂无记录" />
        </el-card>
      </el-col>

      <!-- 右侧：辅助信息 -->
      <el-col :xs="24" :lg="10">
        <!-- 停车场状态 -->
        <el-card class="status-card" shadow="hover">
          <template #header>
            <span><el-icon><DataAnalysis /></el-icon> 停车场实时状态</span>
          </template>
          
          <div class="status-grid">
            <div class="status-item">
              <div class="status-value">{{ parkingStatus.total }}</div>
              <div class="status-label">总车位</div>
            </div>
            <div class="status-item">
              <div class="status-value" style="color: #67c23a;">{{ parkingStatus.available }}</div>
              <div class="status-label">剩余车位</div>
            </div>
            <div class="status-item">
              <div class="status-value" style="color: #f56c6c;">{{ parkingStatus.occupied }}</div>
              <div class="status-label">已用车位</div>
            </div>
            <div class="status-item">
              <div class="status-value" style="color: #e6a23c;">{{ parkingStatus.todayEntries }}</div>
              <div class="status-label">今日入场</div>
            </div>
          </div>

          <el-progress 
            :percentage="occupancyRate" 
            :color="occupancyColor"
            :stroke-width="12"
            class="occupancy-progress"
          />
          <div class="progress-label">车位使用率：{{ occupancyRate }}%</div>
        </el-card>

        <!-- 收费提示 -->
        <el-card class="fee-card" shadow="hover">
          <template #header>
            <span><el-icon><Money /></el-icon> 收费标准</span>
          </template>
          
          <div class="fee-rule" v-if="activeRule">
            <div class="rule-title">{{ activeRule.ruleName }}</div>
            <div class="rule-detail">
              <div class="rule-item">
                <span>计费周期：</span>
                <strong>{{ activeRule.chargeInterval }}分钟</strong>
              </div>
              <div class="rule-item">
                <span>单价：</span>
                <strong>¥{{ activeRule.unitFee }}/周期</strong>
              </div>
              <div class="rule-item" v-if="activeRule.freeMinutes">
                <span>免费时长：</span>
                <strong>{{ activeRule.freeMinutes }}分钟</strong>
              </div>
              <div class="rule-item" v-if="activeRule.dailyMaxFee">
                <span>日封顶：</span>
                <strong>¥{{ activeRule.dailyMaxFee }}</strong>
              </div>
            </div>
          </div>
          
          <div class="fee-example">
            <div class="example-title">计费示例：</div>
            <div class="example-item">
              <span>停车1小时：</span>
              <span class="price">¥{{ calculateExample(60) }}</span>
            </div>
            <div class="example-item">
              <span>停车2小时：</span>
              <span class="price">¥{{ calculateExample(120) }}</span>
            </div>
            <div class="example-item">
              <span>停车24小时：</span>
              <span class="price">¥{{ calculateExample(1440) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="quick-card" shadow="hover">
          <template #header>
            <span><el-icon><Operation /></el-icon> 快捷操作</span>
          </template>
          
          <div class="quick-btns">
            <el-button :icon="List" @click="goToRecords">进出记录查询</el-button>
            <el-button :icon="Van" @click="goToCars">车辆信息管理</el-button>
            <el-button :icon="Setting" @click="goToRules">收费规则设置</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 摄像头弹窗 -->
    <el-dialog
      v-model="cameraDialogVisible"
      title="车牌识别"
      width="800px"
      :close-on-click-modal="false"
      class="camera-dialog"
    >
      <div class="camera-container">
        <div class="camera-preview">
          <video ref="videoRef" autoplay playsinline></video>
          <canvas ref="canvasRef" style="display: none;"></canvas>
          <div class="scan-overlay" v-if="cameraDialogVisible">
            <div class="scan-frame">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
            </div>
            <div class="scan-line"></div>
            <p class="scan-tip">将车牌对准框内</p>
          </div>
        </div>
        <div class="camera-controls">
          <el-button type="primary" size="large" :icon="Camera" @click="capturePlate">
            拍照识别
          </el-button>
          <el-button size="large" @click="closeCamera">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  VideoCamera,
  Manual,
  Right,
  Check,
  RefreshRight,
  Postcard,
  Search,
  User,
  OfficeBuilding,
  Clock,
  DataAnalysis,
  Money,
  List,
  Van,
  Setting,
  Operation,
  Camera
} from '@element-plus/icons-vue'
import { carInOutRecordsApi } from '../../api/carInOutRecords'
import { carsApi } from '../../api/cars'
import { feeRulesApi } from '../../api/feeRules'
import { validateLicensePlate } from '../../utils/validate'
import { formatDate } from '../../utils/date'

const router = useRouter()

// 状态
const loading = ref(false)
const submitting = ref(false)
const manualInput = ref(false)
const cameraActive = ref(false)
const cameraDialogVisible = ref(false)
const entrySuccess = ref(false)
const capturedPlate = ref('')
const capturedImage = ref('')

// Refs
const formRef = ref<any>(null)
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
let mediaStream: MediaStream | null = null

// 表单
const form = reactive({
  LicensePlate: '',
  EntryGate: 'Gate-A',
  EnterTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
  Remark: ''
})

// 数据
const carInfo = ref<any>(null)
const activeRule = ref<any>(null)
const recentEntries = ref<any[]>([])
const parkingStatus = reactive({
  total: 200,
  available: 86,
  occupied: 114,
  todayEntries: 156
})

// 选项
const gateOptions = [
  { label: 'A入口', value: 'Gate-A' },
  { label: 'B入口', value: 'Gate-B' },
  { label: 'C入口', value: 'Gate-C' }
]

// 验证规则
const rules = {
  LicensePlate: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!validateLicensePlate(value)) {
          callback(new Error('车牌号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  EntryGate: [{ required: true, message: '请选择入场通道', trigger: 'change' }],
  EnterTime: [{ required: true, message: '请选择入场时间', trigger: 'change' }]
}

// 计算属性
const occupancyRate = computed(() => {
  return Math.round((parkingStatus.occupied / parkingStatus.total) * 100)
})

const occupancyColor = computed(() => {
  if (occupancyRate.value < 60) return '#67c23a'
  if (occupancyRate.value < 80) return '#e6a23c'
  return '#f56c6c'
})

// 获取数据
const fetchActiveRule = async () => {
  try {
    const res = await feeRulesApi.getActiveRules()
    activeRule.value = res.find((r: any) => r.carType === 'Temporary')
  } catch (error) {
    console.error('获取收费规则失败:', error)
  }
}

const fetchRecentEntries = async () => {
  try {
    const res = await carInOutRecordsApi.getRecords({
      PageSize: 5,
      SortBy: 'enterTime',
      SortDesc: true
    })
    recentEntries.value = res.items.filter((item: any) => !item.leaveTime).slice(0, 5)
  } catch (error) {
    console.error('获取最近入场记录失败:', error)
  }
}

// 摄像头操作
const openCamera = async () => {
  cameraDialogVisible.value = true
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  } catch (error) {
    ElMessage.error('无法访问摄像头，请检查权限设置')
    cameraDialogVisible.value = false
  }
}

const closeCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  cameraDialogVisible.value = false
}

const capturePlate = () => {
  if (!videoRef.value || !canvasRef.value) return
  
  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(video, 0, 0)
  
  // 模拟OCR识别
  capturedImage.value = canvas.toDataURL('image/jpeg')
  capturedPlate.value = '京A' + Math.floor(10000 + Math.random() * 90000)
  
  closeCamera()
  cameraActive.value = false
  
  // 自动填充表单
  form.LicensePlate = capturedPlate.value
  queryCarInfo()
  
  ElMessage.success('识别成功，请核对车牌号')
}

const retake = () => {
  capturedPlate.value = ''
  capturedImage.value = ''
  form.LicensePlate = ''
  carInfo.value = null
  openCamera()
}

const confirmPlate = () => {
  manualInput.value = true
}

// 查询车辆信息
const queryCarInfo = async () => {
  if (!form.LicensePlate) return
  
  try {
    const res = await carsApi.searchCars(form.LicensePlate)
    if (res && res.length > 0) {
      carInfo.value = res[0]
    } else {
      carInfo.value = null
    }
  } catch (error) {
    carInfo.value = null
  }
}

// 提交入场
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    await carInOutRecordsApi.enter({
      LicensePlate: form.LicensePlate,
      EntryGate: form.EntryGate,
      EnterTime: form.EnterTime,
      Remark: form.Remark
    })
    
    entrySuccess.value = true
    ElMessage.success('入场登记成功')
    fetchRecentEntries()
    
    // 更新停车场状态
    parkingStatus.available--
    parkingStatus.occupied++
    parkingStatus.todayEntries++
  } catch (error) {
    ElMessage.error('入场登记失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.EnterTime = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
  carInfo.value = null
  capturedPlate.value = ''
  capturedImage.value = ''
  entrySuccess.value = false
}

const nextEntry = () => {
  resetForm()
  manualInput.value = false
}

const printTicket = () => {
  ElMessage.success('打印入场小票')
  window.print()
}

// 辅助函数
const calculateExample = (minutes: number) => {
  if (!activeRule.value) return 0
  
  const rule = activeRule.value
  const chargeMinutes = Math.max(0, minutes - (rule.freeMinutes || 0))
  const periods = Math.ceil(chargeMinutes / rule.chargeInterval)
  let fee = periods * rule.unitFee
  
  if (rule.dailyMaxFee && fee > rule.dailyMaxFee) {
    fee = rule.dailyMaxFee
  }
  
  return fee.toFixed(2)
}

const formatTime = (date: string) => {
  return formatDate(date, 'HH:mm:ss')
}

const formatDateTime = (date: string) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

const refreshRecent = () => {
  fetchRecentEntries()
  ElMessage.success('已刷新')
}

const goBack = () => router.back()
const goToRecords = () => router.push('/parking/records')
const goToCars = () => router.push('/cars')
const goToRules = () => router.push('/fees/rules')

onMounted(() => {
  fetchActiveRule()
  fetchRecentEntries()
})

onUnmounted(() => {
  closeCamera()
})
</script>

<style scoped>
.enter-record-container {
  padding: 0;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 入场卡片 */
.entry-card {
  margin-bottom: 20px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 车牌识别区域 */
.plate-recognition {
  margin-bottom: 24px;
}

.camera-view {
  background: #000;
  border-radius: 12px;
  height: 300px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-view.active {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.camera-placeholder {
  text-align: center;
  color: #909399;
}

.camera-placeholder p {
  margin: 8px 0;
}

.camera-placeholder .sub-text {
  font-size: 13px;
  color: #c0c4cc;
}

/* 扫描动画 */
.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 150px;
  border: 2px solid rgba(24, 144, 255, 0.3);
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #1890ff;
  border-style: solid;
}

.corner.top-left {
  top: -2px;
  left: -2px;
  border-width: 4px 0 0 4px;
}

.corner.top-right {
  top: -2px;
  right: -2px;
  border-width: 4px 4px 0 0;
}

.corner.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 4px 4px;
}

.corner.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 4px 4px 0;
}

.scan-line {
  position: absolute;
  top: 25%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(to right, transparent, #1890ff, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 25%; }
  50% { top: 75%; }
  100% { top: 25%; }
}

.scan-text {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #1890ff;
  font-size: 14px;
}

/* 识别结果 */
.plate-result {
  text-align: center;
  color: #fff;
}

.plate-image {
  width: 320px;
  height: 180px;
  margin: 0 auto 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid #67c23a;
}

.plate-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plate-number-large {
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.plate-confidence {
  margin-top: 8px;
  color: #67c23a;
  font-size: 14px;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

/* 表单样式 */
.entry-form {
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.plate-input :deep(.el-input__inner) {
  font-size: 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.car-info-panel {
  margin: -10px 0 20px;
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.owner-name {
  color: #595959;
  display: flex;
  align-items: center;
  gap: 4px;
}

.blacklist-alert {
  margin-top: 12px;
}

.submit-btn {
  width: 160px;
  height: 48px;
  font-size: 16px;
}

.success-panel {
  margin-top: 20px;
  padding: 20px;
  background: #f6ffed;
  border-radius: 8px;
}

/* 最近记录卡片 */
.recent-card {
  border: none;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.timeline-plate {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #303133;
}

.timeline-gate {
  color: #909399;
  font-size: 13px;
}

/* 状态卡片 */
.status-card {
  margin-bottom: 20px;
  border: none;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.status-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.status-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.status-label {
  font-size: 13px;
  color: #909399;
}

.occupancy-progress {
  margin-bottom: 8px;
}

.progress-label {
  text-align: center;
  color: #606266;
  font-size: 13px;
}

/* 收费卡片 */
.fee-card {
  margin-bottom: 20px;
  border: none;
}

.rule-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e4e7ed;
}

.rule-detail {
  margin-bottom: 20px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #606266;
  font-size: 14px;
}

.fee-example {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 16px;
}

.example-title {
  font-weight: 600;
  color: #fa8c16;
  margin-bottom: 12px;
}

.example-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #595959;
}

.example-item .price {
  color: #cf1322;
  font-weight: 600;
}

/* 快捷操作卡片 */
.quick-card {
  border: none;
}

.quick-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-btns .el-button {
  justify-content: flex-start;
}

/* 摄像头弹窗 */
.camera-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.camera-container {
  display: flex;
  flex-direction: column;
}

.camera-preview {
  position: relative;
  background: #000;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan-tip {
  position: absolute;
  bottom: 40px;
  color: #fff;
  font-size: 16px;
  background: rgba(0,0,0,0.5);
  padding: 8px 24px;
  border-radius: 20px;
}

.camera-controls {
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  background: #f5f7fa;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .camera-view {
    height: 200px;
  }
  
  .plate-image {
    width: 240px;
    height: 135px;
  }
  
  .plate-number-large {
    font-size: 24px;
  }
}
</style>
/**
页面布局：
左侧：车牌识别区域 + 入场表单 + 最近入场记录
右侧：停车场实时状态 + 收费标准 + 快捷操作
核心功能：
车牌识别
摄像头实时扫描（带扫描框动画）
拍照识别（模拟OCR）
识别结果展示（车牌大图+置信度）
支持重新拍摄和确认使用
入场登记
车牌号输入（自动转大写）
车辆信息查询（自动识别业主/临时车）
黑名单车辆警告提示
入场通道选择（A/B/C入口）
入场时间设置（默认当前时间）
备注信息
实时状态面板
总车位/剩余车位/已用车位/今日入场
车位使用率进度条（颜色预警）
收费标准展示（计费周期/单价/免费时长/日封顶）
计费示例（1小时/2小时/24小时）
最近入场记录
时间线展示最近5条记录
区分业主车（绿色）和临时车（蓝色）
显示入场时间和通道
交互体验：
识别成功后自动填充并查询车辆信息
业主车辆自动显示业主姓名
黑名单车辆红色警告提示
入场成功后显示操作结果（打印小票/下一辆）
快捷键支持（Enter提交）
*/