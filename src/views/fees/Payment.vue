<template>
  <div class="payment-page">
    <!-- 顶部导航 -->
    <div class="payment-header">
      <div class="header-content">
        <div class="brand" @click="goHome">
          <el-icon size="28" color="#fff"><Van /></el-icon>
          <span class="brand-text">停车缴费</span>
        </div>
        <div class="header-right">
          <el-button link type="info" @click="showHelp">
            <el-icon><QuestionFilled /></el-icon> 帮助
          </el-button>
        </div>
      </div>
    </div>

    <div class="payment-main">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 主要内容 -->
      <template v-else>
        <!-- 左侧：停车信息 -->
        <div class="info-section">
          <div class="plate-display">
            <div class="plate-number">{{ record?.licensePlate }}</div>
            <el-tag :type="record?.carType === 'Owner' ? 'success' : 'warning'" effect="dark" size="large">
              {{ record?.carType === 'Owner' ? '业主车辆' : '临时车辆' }}
            </el-tag>
          </div>

          <div class="parking-info">
            <div class="info-item">
              <div class="info-icon enter">
                <el-icon><ArrowRightBold /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">入场时间</div>
                <div class="info-value">{{ formatDateTime(record?.enterTime) }}</div>
              </div>
            </div>

            <div class="duration-line">
              <div class="duration-badge">
                <el-icon><Timer /></el-icon>
                <span>{{ formatDuration(record?.parkingDuration) }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon exit">
                <el-icon><ArrowLeftBold /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">出场时间</div>
                <div class="info-value">{{ record?.leaveTime ? formatDateTime(record.leaveTime) : '停车中' }}</div>
              </div>
            </div>
          </div>

          <!-- 费用明细 -->
          <div class="fee-detail">
            <div class="detail-title">费用明细</div>
            <div class="detail-item">
              <span>停车时长</span>
              <span>{{ formatDuration(record?.parkingDuration) }}</span>
            </div>
            <div class="detail-item">
              <span>计费标准</span>
              <span>{{ feeRule?.ruleName || '标准计费' }}</span>
            </div>
            <div class="detail-item" v-if="feeRule?.freeMinutes">
              <span>免费时长</span>
              <span>{{ feeRule.freeMinutes }}分钟</span>
            </div>
            <div class="detail-item highlight">
              <span>应付金额</span>
              <span class="amount">¥{{ record?.feeAmount.toFixed(2) }}</span>
            </div>
            <div class="detail-item discount" v-if="discountAmount > 0">
              <span>优惠减免</span>
              <span class="discount-amount">-¥{{ discountAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 优惠券 -->
          <div class="coupon-section" v-if="availableCoupons.length > 0">
            <div class="section-title">
              <el-icon><Ticket /></el-icon>
              <span>优惠券</span>
              <el-tag v-if="selectedCoupon" type="success" size="small" class="ml-sm">已省¥{{ discountAmount.toFixed(2) }}</el-tag>
            </div>
            <div class="coupon-list">
              <div
                v-for="coupon in availableCoupons"
                :key="coupon.id"
                class="coupon-item"
                :class="{ active: selectedCoupon?.id === coupon.id, disabled: coupon.minAmount > (record?.feeAmount || 0) }"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-value">
                  <span class="symbol">¥</span>
                  <span class="number">{{ coupon.amount }}</span>
                </div>
                <div class="coupon-info">
                  <div class="coupon-name">{{ coupon.name }}</div>
                  <div class="coupon-desc">满{{ coupon.minAmount }}元可用</div>
                  <div class="coupon-time">有效期至{{ coupon.expireTime }}</div>
                </div>
                <div class="coupon-check">
                  <el-icon v-if="selectedCoupon?.id === coupon.id"><CircleCheckFilled /></el-icon>
                  <el-icon v-else><CircleCheck /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：支付区域 -->
        <div class="pay-section">
          <div class="pay-card">
            <div class="pay-amount">
              <div class="amount-label">支付金额</div>
              <div class="amount-value">
                <span class="currency">¥</span>
                <span class="number">{{ finalAmount.toFixed(2) }}</span>
              </div>
              <div class="amount-original" v-if="discountAmount > 0">
                原价：<del>¥{{ record?.feeAmount.toFixed(2) }}</del>
              </div>
            </div>

            <div class="pay-methods">
              <div class="method-title">选择支付方式</div>
              
              <!-- 微信支付 -->
              <div 
                class="method-item"
                :class="{ active: selectedMethod === 'WeChat' }"
                @click="selectedMethod = 'WeChat'"
              >
                <div class="method-icon wechat">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
                <div class="method-info">
                  <div class="method-name">微信支付</div>
                  <div class="method-desc">推荐使用</div>
                </div>
                <div class="method-check">
                  <el-icon v-if="selectedMethod === 'WeChat'"><CircleCheckFilled /></el-icon>
                  <el-icon v-else><CircleCheck /></el-icon>
                </div>
              </div>

              <!-- 支付宝 -->
              <div 
                class="method-item"
                :class="{ active: selectedMethod === 'Alipay' }"
                @click="selectedMethod = 'Alipay'"
              >
                <div class="method-icon alipay">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="method-info">
                  <div class="method-name">支付宝</div>
                  <div class="method-desc">数亿用户的选择</div>
                </div>
                <div class="method-check">
                  <el-icon v-if="selectedMethod === 'Alipay'"><CircleCheckFilled /></el-icon>
                  <el-icon v-else><CircleCheck /></el-icon>
                </div>
              </div>

              <!-- 现金支付（仅现场） -->
              <div 
                class="method-item"
                :class="{ active: selectedMethod === 'Cash' }"
                @click="selectedMethod = 'Cash'"
                v-if="isOnsite"
              >
                <div class="method-icon cash">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="method-info">
                  <div class="method-name">现金支付</div>
                  <div class="method-desc">现场缴费</div>
                </div>
                <div class="method-check">
                  <el-icon v-if="selectedMethod === 'Cash'"><CircleCheckFilled /></el-icon>
                  <el-icon v-else><CircleCheck /></el-icon>
                </div>
              </div>
            </div>

            <el-button 
              type="primary" 
              size="large" 
              class="pay-btn"
              :loading="paying"
              :disabled="!selectedMethod"
              @click="handlePay"
            >
              <template v-if="paying">
                支付中...
              </template>
              <template v-else>
                确认支付 ¥{{ finalAmount.toFixed(2) }}
              </template>
            </el-button>

            <div class="pay-tips">
              <el-icon><InfoFilled /></el-icon>
              <span>请在15分钟内完成支付，超时订单将自动取消</span>
            </div>
          </div>

          <!-- 发票信息 -->
          <div class="invoice-card">
            <div class="invoice-header" @click="showInvoice = !showInvoice">
              <span>开具发票</span>
              <el-icon class="arrow-icon" :class="{ rotate: showInvoice }"><ArrowDown /></el-icon>
            </div>
            <el-collapse-transition>
              <div v-show="showInvoice" class="invoice-content">
                <el-form :model="invoiceForm" label-position="top">
                  <el-form-item label="发票类型">
                    <el-radio-group v-model="invoiceForm.type">
                      <el-radio label="personal">个人</el-radio>
                      <el-radio label="company">企业</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="发票抬头" v-if="invoiceForm.type === 'company'">
                    <el-input v-model="invoiceForm.title" placeholder="企业名称" />
                  </el-form-item>
                  <el-form-item label="税号" v-if="invoiceForm.type === 'company'">
                    <el-input v-model="invoiceForm.taxNo" placeholder="纳税人识别号" />
                  </el-form-item>
                  <el-form-item label="电子邮箱">
                    <el-input v-model="invoiceForm.email" placeholder="接收电子发票" />
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </template>
    </div>

    <!-- 支付结果弹窗 -->
    <el-dialog
      v-model="resultVisible"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      center
      class="result-dialog"
    >
      <div class="result-content">
        <div class="result-icon" :class="payResult.status">
          <el-icon size="60" v-if="payResult.status === 'success'"><CircleCheckFilled /></el-icon>
          <el-icon size="60" v-else-if="payResult.status === 'fail'"><CircleCloseFilled /></el-icon>
          <el-icon size="60" v-else><Loading /></el-icon>
        </div>
        <div class="result-title">{{ payResult.title }}</div>
        <div class="result-message">{{ payResult.message }}</div>
        
        <div class="result-detail" v-if="payResult.status === 'success'">
          <div class="detail-row">
            <span>支付金额</span>
            <span class="amount">¥{{ finalAmount.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span>交易单号</span>
            <span>{{ payResult.tradeNo }}</span>
          </div>
          <div class="detail-row">
            <span>支付时间</span>
            <span>{{ formatDateTime(payResult.time) }}</span>
          </div>
        </div>

        <div class="result-actions">
          <el-button 
            type="primary" 
            size="large" 
            v-if="payResult.status === 'success'"
            @click="viewRecord"
          >
            查看记录
          </el-button>
          <el-button 
            size="large" 
            v-if="payResult.status === 'fail'"
            @click="retryPay"
          >
            重新支付
          </el-button>
          <el-button size="large" @click="goHome">
            返回首页
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 帮助弹窗 -->
    <el-dialog v-model="helpVisible" title="缴费帮助" width="500px">
      <div class="help-content">
        <h4>如何缴费？</h4>
        <p>1. 确认车牌号和停车信息无误</p>
        <p>2. 选择可用的优惠券（如有）</p>
        <p>3. 选择微信支付或支付宝</p>
        <p>4. 点击确认支付，完成扫码支付</p>
        
        <h4>常见问题</h4>
        <p><strong>Q: 支付失败怎么办？</strong></p>
        <p>A: 请检查网络连接，或尝试更换支付方式。</p>
        <p><strong>Q: 如何获取发票？</strong></p>
        <p>A: 在支付前填写发票信息，支付成功后自动发送至邮箱。</p>
        <p><strong>Q: 优惠券如何使用？</strong></p>
        <p>A: 满足使用条件的优惠券会自动显示，点击即可使用。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Van,
  QuestionFilled,
  ArrowRightBold,
  ArrowLeftBold,
  Timer,
  ChatDotRound,
  Money,
  Wallet,
  CircleCheck,
  CircleCheckFilled,
  CircleCloseFilled,
  InfoFilled,
  Ticket,
  ArrowDown,
  Loading
} from '@element-plus/icons-vue'
import { feeRecordsApi } from '../../api/feeRecords'
import { feeRulesApi } from '../../api/feeRules'
import { formatDate, formatDuration } from '../../utils/date'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const paying = ref(false)
const resultVisible = ref(false)
const helpVisible = ref(false)
const showInvoice = ref(false)
const isOnsite = ref(false) // 是否现场缴费

// 数据
const record = ref<any>(null)
const feeRule = ref<any>(null)
const selectedMethod = ref<'WeChat' | 'Alipay' | 'Cash'>('WeChat')
const selectedCoupon = ref<any>(null)

// 优惠券列表（模拟）
const availableCoupons = ref([
  { id: 1, name: '新用户优惠券', amount: 5, minAmount: 10, expireTime: '2024-12-31' },
  { id: 2, name: '满20减3', amount: 3, minAmount: 20, expireTime: '2024-12-31' },
  { id: 3, name: '业主专享', amount: 10, minAmount: 50, expireTime: '2024-12-31' }
])

// 发票表单
const invoiceForm = ref({
  type: 'personal',
  title: '',
  taxNo: '',
  email: ''
})

// 支付结果
const payResult = ref({
  status: 'processing' as 'success' | 'fail' | 'processing',
  title: '',
  message: '',
  tradeNo: '',
  time: ''
})

// 计算属性
const discountAmount = computed(() => {
  if (!selectedCoupon.value || !record.value) return 0
  if (selectedCoupon.value.minAmount > record.value.feeAmount) return 0
  return Math.min(selectedCoupon.value.amount, record.value.feeAmount)
})

const finalAmount = computed(() => {
  if (!record.value) return 0
  return Math.max(0, record.value.feeAmount - discountAmount.value)
})

// 获取记录详情
const fetchRecord = async () => {
  const recordId = route.query.recordId as string
  if (!recordId) {
    ElMessage.error('缺少记录ID')
    router.push('/')
    return
  }

  try {
    // 模拟获取记录
    record.value = {
      id: Number(recordId),
      licensePlate: '京A88888',
      carType: 'Temporary',
      enterTime: new Date(Date.now() - 3600000 * 2).toISOString(), // 2小时前
      leaveTime: new Date().toISOString(),
      parkingDuration: 120, // 2小时
      feeAmount: 15.00
    }

    // 获取计费规则
    const rules = await feeRulesApi.getFeeRuleByType(record.value.carType)
    feeRule.value = rules
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 辅助函数
const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 选择优惠券
const selectCoupon = (coupon: any) => {
  if (coupon.minAmount > (record.value?.feeAmount || 0)) {
    ElMessage.warning('未达到使用门槛')
    return
  }
  if (selectedCoupon.value?.id === coupon.id) {
    selectedCoupon.value = null
  } else {
    selectedCoupon.value = coupon
    ElMessage.success(`已使用${coupon.name}，优惠¥${coupon.amount}`)
  }
}

// 支付处理
const handlePay = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  paying.value = true
  resultVisible.value = true
  payResult.value.status = 'processing'
  payResult.value.title = '正在支付...'
  payResult.value.message = '请稍候，正在处理您的支付请求'

  try {
    // 模拟支付流程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 调用支付API
    await feeRecordsApi.pay({
      RecordId: record.value.id,
      PaymentMethod: selectedMethod.value,
      CustomAmount: finalAmount.value,
      Remark: selectedCoupon.value ? `使用优惠券：${selectedCoupon.value.name}` : ''
    })

    // 支付成功
    payResult.value = {
      status: 'success',
      title: '支付成功',
      message: '感谢您的使用，祝您一路顺风！',
      tradeNo: 'PAY' + Date.now(),
      time: new Date().toISOString()
    }
    
    // 发送发票（如果填写了邮箱）
    if (invoiceForm.value.email) {
      console.log('发送发票到:', invoiceForm.value.email)
    }
  } catch (error) {
    payResult.value = {
      status: 'fail',
      title: '支付失败',
      message: '网络异常或余额不足，请重试',
      tradeNo: '',
      time: ''
    }
  } finally {
    paying.value = false
  }
}

// 结果页操作
const viewRecord = () => {
  router.push('/fees/my-records')
}

const retryPay = () => {
  resultVisible.value = false
  payResult.value.status = 'processing'
}

const goHome = () => {
  router.push('/')
}

const showHelp = () => {
  helpVisible.value = true
}

onMounted(() => {
  fetchRecord()
  // 检查是否现场缴费（通过URL参数或环境判断）
  isOnsite.value = route.query.mode === 'onsite'
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航 */
.payment-header {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-text {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

/* 主体内容 */
.payment-main {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

@media (max-width: 768px) {
  .payment-main {
    grid-template-columns: 1fr;
  }
}

/* 信息区域 */
.info-section {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.plate-display {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 12px;
  color: #fff;
  margin-bottom: 30px;
}

.plate-number {
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 停车信息 */
.parking-info {
  position: relative;
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.info-icon.enter {
  background: #52c41a;
}

.info-icon.exit {
  background: #ff4d4f;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.duration-line {
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duration-line::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #52c41a, #ff4d4f);
}

.duration-badge {
  background: #fff;
  border: 2px solid #1890ff;
  border-radius: 20px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1890ff;
  z-index: 1;
}

/* 费用明细 */
.fee-detail {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #d9d9d9;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  color: #595959;
  font-size: 14px;
}

.detail-item.highlight {
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px dashed #d9d9d9;
  font-size: 16px;
  font-weight: 600;
}

.detail-item.highlight .amount {
  color: #cf1322;
  font-size: 24px;
}

.detail-item.discount {
  color: #52c41a;
}

.detail-item.discount .discount-amount {
  font-weight: 600;
}

/* 优惠券 */
.coupon-section {
  margin-top: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.coupon-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff4d4f;
}

.coupon-item:hover {
  border-color: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
}

.coupon-item.active {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.coupon-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coupon-value {
  color: #ff4d4f;
  font-weight: bold;
  min-width: 60px;
}

.coupon-value .symbol {
  font-size: 14px;
}

.coupon-value .number {
  font-size: 28px;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: #ff4d4f;
  margin-bottom: 2px;
}

.coupon-time {
  font-size: 12px;
  color: #8c8c8c;
}

.coupon-check {
  font-size: 24px;
  color: #d9d9d9;
}

.coupon-item.active .coupon-check {
  color: #ff4d4f;
}

/* 支付区域 */
.pay-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pay-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.pay-amount {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #fff2f0 0%, #fff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.amount-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.amount-value {
  color: #cf1322;
  font-weight: bold;
  line-height: 1;
}

.amount-value .currency {
  font-size: 24px;
}

.amount-value .number {
  font-size: 48px;
}

.amount-original {
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 14px;
}

.amount-original del {
  color: #bfbfbf;
}

/* 支付方式 */
.method-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #d9d9d9;
}

.method-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.method-icon.wechat {
  background: #07c160;
}

.method-icon.alipay {
  background: #1677ff;
}

.method-icon.cash {
  background: #fa8c16;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.method-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 2px;
}

.method-check {
  font-size: 24px;
  color: #d9d9d9;
}

.method-item.active .method-check {
  color: #1890ff;
}

.pay-btn {
  width: 100%;
  height: 52px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border: none;
}

.pay-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
}

.pay-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: #8c8c8c;
  font-size: 13px;
}

/* 发票卡片 */
.invoice-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.invoice-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

.arrow-icon {
  transition: transform 0.3s;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.invoice-content {
  padding: 24px;
}

/* 结果弹窗 */
.result-dialog :deep(.el-dialog__header) {
  display: none;
}

.result-content {
  text-align: center;
  padding: 20px;
}

.result-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 60px;
}

.result-icon.success {
  background: #f6ffed;
  color: #52c41a;
}

.result-icon.fail {
  background: #fff2f0;
  color: #ff4d4f;
}

.result-icon.processing {
  background: #e6f7ff;
  color: #1890ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.result-message {
  color: #595959;
  margin-bottom: 24px;
}

.result-detail {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .amount {
  color: #cf1322;
  font-size: 20px;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 帮助内容 */
.help-content {
  line-height: 2;
  color: #595959;
}

.help-content h4 {
  color: #262626;
  margin: 16px 0 8px;
  font-size: 16px;
}

.help-content p {
  margin: 4px 0;
}

/* 加载状态 */
.loading-state {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
}

/* 响应式 */
@media (max-width: 768px) {
  .payment-header {
    padding: 12px 0;
  }
  
  .brand-text {
    font-size: 18px;
  }
  
  .payment-main {
    margin: 16px auto;
    padding: 0 16px;
  }
  
  .info-section,
  .pay-card,
  .invoice-card {
    padding: 20px;
  }
  
  .plate-number {
    font-size: 28px;
  }
  
  .amount-value .number {
    font-size: 36px;
  }
}
</style>
/**
页面布局：
顶部渐变导航栏（品牌标识+帮助按钮）
双栏布局：左侧停车信息，右侧支付区域
移动端自动变为单栏
左侧信息区：
大号车牌号展示（渐变背景）
停车时间线（入场/出场图标+时长徽章）
费用明细（时长、计费标准、免费时长、应付金额）
优惠券列表（带使用门槛，点击选择）
右侧支付区：
大字体支付金额（原价删除线展示）
支付方式选择（微信/支付宝/现金），带图标和推荐标签
发票信息折叠面板（个人/企业、邮箱）
确认支付按钮（渐变背景+悬停效果）
交互流程：
加载记录详情（入场/出场时间、费用计算）
选择优惠券（自动计算优惠后金额）
选择支付方式（默认微信）
填写发票信息（可选）
支付中状态（弹窗显示进度）
支付结果（成功/失败，显示交易详情）
用户体验优化：
15分钟支付倒计时提示
优惠券不可用状态置灰
支付按钮加载状态
结果页快捷操作（查看记录/返回首页）
帮助弹窗解答常见问题
*/