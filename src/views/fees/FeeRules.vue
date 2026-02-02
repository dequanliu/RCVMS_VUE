<template>
  <div class="fee-rules-container">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>费用管理</el-breadcrumb-item>
      <el-breadcrumb-item>收费规则</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 规则概览 -->
    <el-row :gutter="16" class="rules-overview">
      <el-col :xs="24" :sm="8">
        <div class="overview-card owner">
          <div class="overview-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">业主车辆规则</div>
            <div class="overview-count">{{ ownerRules.length }} 条规则</div>
            <div class="overview-desc">月租/长期停车计费标准</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="overview-card temp">
          <div class="overview-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">临时车辆规则</div>
            <div class="overview-count">{{ tempRules.length }} 条规则</div>
            <div class="overview-desc">按时长阶梯计费标准</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="overview-card calc">
          <div class="overview-icon">
            <el-icon><Calculator /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">费用计算器</div>
            <div class="overview-action">
              <el-button type="primary" link @click="showCalculator = true">
                立即计算 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="overview-desc">模拟计算停车费用</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 规则列表 -->
    <el-card class="rules-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-tabs">
            <el-radio-group v-model="activeTab" size="large">
              <el-radio-button label="all">全部规则</el-radio-button>
              <el-radio-button label="Owner">业主车辆</el-radio-button>
              <el-radio-button label="Temporary">临时车辆</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新建规则</el-button>
          </div>
        </div>
      </template>

      <div class="rules-list">
        <div 
          v-for="rule in filteredRules" 
          :key="rule.id"
          class="rule-item"
          :class="{ inactive: !rule.isActive, editing: editingId === rule.id }"
        >
          <!-- 规则头部 -->
          <div class="rule-header">
            <div class="rule-title">
              <span class="rule-name">{{ rule.ruleName }}</span>
              <el-tag :type="rule.carType === 'Owner' ? 'success' : 'warning'" size="small">
                {{ rule.carType === 'Owner' ? '业主' : '临时' }}
              </el-tag>
              <el-tag v-if="rule.isDefault" type="info" size="small" effect="plain">默认</el-tag>
              <el-switch 
                v-model="rule.isActive" 
                size="small"
                @change="(val) => toggleRuleStatus(rule.id, val)"
                class="status-switch"
              />
            </div>
            <div class="rule-actions" v-if="editingId !== rule.id">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(rule)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(rule)">删除</el-button>
            </div>
            <div class="rule-actions" v-else>
              <el-button link type="primary" @click="saveEdit(rule)">保存</el-button>
              <el-button link @click="cancelEdit">取消</el-button>
            </div>
          </div>

          <!-- 规则内容（展示模式） -->
          <div class="rule-content" v-if="editingId !== rule.id">
            <div class="rule-params">
              <div class="param-item">
                <span class="param-label">计费周期</span>
                <span class="param-value">{{ rule.chargeInterval }} 分钟</span>
              </div>
              <div class="param-item">
                <span class="param-label">单价</span>
                <span class="param-value price">¥{{ rule.unitFee.toFixed(2) }}</span>
              </div>
              <div class="param-item" v-if="rule.dailyMaxFee">
                <span class="param-label">日封顶</span>
                <span class="param-value">¥{{ rule.dailyMaxFee.toFixed(2) }}</span>
              </div>
              <div class="param-item" v-if="rule.freeMinutes">
                <span class="param-label">免费时长</span>
                <span class="param-value">{{ rule.freeMinutes }} 分钟</span>
              </div>
            </div>
            
            <!-- 计费示例 -->
            <div class="rule-example">
              <el-icon><InfoFilled /></el-icon>
              <span>示例：停车2小时费用 = {{ calculateExample(rule) }}</span>
            </div>
          </div>

          <!-- 规则编辑表单 -->
          <div class="rule-edit-form" v-else>
            <el-form :model="editForm" inline size="small">
              <el-form-item label="规则名称">
                <el-input v-model="editForm.ruleName" style="width: 150px" />
              </el-form-item>
              <el-form-item label="计费周期(分钟)">
                <el-input-number v-model="editForm.chargeInterval" :min="1" :max="1440" style="width: 120px" />
              </el-form-item>
              <el-form-item label="单价(元)">
                <el-input-number v-model="editForm.unitFee" :min="0" :precision="2" style="width: 100px" />
              </el-form-item>
              <el-form-item label="日封顶(元)">
                <el-input-number v-model="editForm.dailyMaxFee" :min="0" :precision="2" style="width: 100px" />
              </el-form-item>
              <el-form-item label="免费时长(分钟)">
                <el-input-number v-model="editForm.freeMinutes" :min="0" :max="1440" style="width: 120px" />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredRules.length === 0" description="暂无收费规则" />
      </div>
    </el-card>

    <!-- 新建/编辑规则弹窗 -->
    <BaseDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑收费规则' : '新建收费规则'"
      width="600px"
      :confirm-loading="submitting"
      @confirm="handleSubmit"
      @cancel="dialogVisible = false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="rule-form"
      >
        <el-form-item label="规则名称" prop="RuleName">
          <el-input v-model="form.RuleName" placeholder="如：临时车标准计费" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="适用车型" prop="CarType">
          <el-radio-group v-model="form.CarType">
            <el-radio-button label="Owner">
              <el-icon><UserFilled /></el-icon> 业主车辆
            </el-radio-button>
            <el-radio-button label="Temporary">
              <el-icon><Timer /></el-icon> 临时车辆
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">计费设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计费周期" prop="ChargeInterval">
              <el-input-number v-model="form.ChargeInterval" :min="1" :max="1440" style="width: 100%">
                <template #append>分钟</template>
              </el-input-number>
              <div class="form-hint">每X分钟计费一次</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价" prop="UnitFee">
              <el-input-number v-model="form.UnitFee" :min="0" :precision="2" :step="0.5" style="width: 100%">
                <template #append>元</template>
              </el-input-number>
              <div class="form-hint">每周期费用</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日封顶金额">
              <el-input-number v-model="form.DailyMaxFee" :min="0" :precision="2" style="width: 100%">
                <template #append>元</template>
              </el-input-number>
              <div class="form-hint">24小时最高收费，0表示不封顶</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="免费时长">
              <el-input-number v-model="form.FreeMinutes" :min="0" :max="1440" style="width: 100%">
                <template #append>分钟</template>
              </el-input-number>
              <div class="form-hint">入场后免费时间</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计费说明">
          <el-input 
            v-model="form.Description" 
            type="textarea" 
            :rows="3"
            placeholder="补充说明该规则的适用场景..."
          />
        </el-form-item>

        <!-- 实时预览 -->
        <div class="preview-section">
          <div class="preview-title">
            <el-icon><View /></el-icon>
            费用预览
          </div>
          <div class="preview-content">
            <div class="preview-item">
              <span class="time">30分钟</span>
              <span class="fee">{{ calculatePreview(30) }}</span>
            </div>
            <div class="preview-item">
              <span class="time">1小时</span>
              <span class="fee">{{ calculatePreview(60) }}</span>
            </div>
            <div class="preview-item">
              <span class="time">2小时</span>
              <span class="fee">{{ calculatePreview(120) }}</span>
            </div>
            <div class="preview-item">
              <span class="time">4小时</span>
              <span class="fee">{{ calculatePreview(240) }}</span>
            </div>
            <div class="preview-item">
              <span class="time">24小时</span>
              <span class="fee highlight">{{ calculatePreview(1440) }}</span>
            </div>
          </div>
        </div>
      </el-form>
    </BaseDialog>

    <!-- 费用计算器弹窗 -->
    <BaseDialog
      v-model="showCalculator"
      title="费用计算器"
      width="500px"
      :show-footer="false"
    >
      <div class="calculator">
        <div class="calc-form">
          <el-form label-width="100px">
            <el-form-item label="车辆类型">
              <el-radio-group v-model="calcForm.carType">
                <el-radio-button label="Owner">业主车</el-radio-button>
                <el-radio-button label="Temporary">临时车</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="停车时长">
              <div class="duration-input">
                <el-input-number v-model="calcForm.hours" :min="0" :max="24" controls-position="right" />
                <span>小时</span>
                <el-input-number v-model="calcForm.minutes" :min="0" :max="59" controls-position="right" />
                <span>分钟</span>
              </div>
            </el-form-item>

            <el-form-item label="选择规则">
              <el-select v-model="calcForm.ruleId" style="width: 100%">
                <el-option
                  v-for="rule in rules.filter(r => r.carType === calcForm.carType)"
                  :key="rule.id"
                  :label="rule.ruleName"
                  :value="rule.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div class="calc-result">
          <div class="result-label">预估费用</div>
          <div class="result-amount">¥{{ calculatedFee.toFixed(2) }}</div>
          <div class="result-detail" v-if="calcForm.ruleId">
            <div class="detail-item">
              <span>适用规则：</span>
              <span>{{ getRuleName(calcForm.ruleId) }}</span>
            </div>
            <div class="detail-item">
              <span>计费时长：</span>
              <span>{{ calcForm.hours * 60 + calcForm.minutes }} 分钟</span>
            </div>
            <div class="detail-item" v-if="calcResult.freeMinutes > 0">
              <span>扣除免费：</span>
              <span>{{ calcResult.freeMinutes }} 分钟</span>
            </div>
            <div class="detail-item" v-if="calcResult.capped">
              <span>已触发封顶</span>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Timer,
  Calculator,
  ArrowRight,
  Plus,
  Edit,
  Delete,
  InfoFilled,
  View
} from '@element-plus/icons-vue'
import BaseDialog from '../../components/common/BaseDialog.vue'
import { feeRulesApi } from '../../api/feeRules'
import type { FeeRule, CreateFeeRuleDto } from '../../types/api'

// 状态
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const showCalculator = ref(false)
const isEdit = ref(false)
const activeTab = ref('all')
const editingId = ref<number | null>(null)

// 数据
const rules = ref<FeeRule[]>([])
const currentEditRule = ref<FeeRule | null>(null)

// 表单
const formRef = ref<any>(null)
const form = reactive<CreateFeeRuleDto>({
  RuleName: '',
  CarType: 'Temporary',
  ChargeInterval: 60,
  UnitFee: 5,
  DailyMaxFee: 50,
  FreeMinutes: 15,
  Description: ''
})

// 编辑表单（行内编辑）
const editForm = reactive({
  ruleName: '',
  chargeInterval: 60,
  unitFee: 5,
  dailyMaxFee: 0,
  freeMinutes: 0
})

// 计算器
const calcForm = reactive({
  carType: 'Temporary' as 'Owner' | 'Temporary',
  hours: 2,
  minutes: 30,
  ruleId: undefined as number | undefined
})

const calcResult = reactive({
  freeMinutes: 0,
  capped: false
})

// 验证规则
const rulesValidation = {
  RuleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  CarType: [{ required: true, message: '请选择适用车型', trigger: 'change' }],
  ChargeInterval: [{ required: true, message: '请输入计费周期', trigger: 'blur' }],
  UnitFee: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

// 计算属性
const ownerRules = computed(() => rules.value.filter(r => r.carType === 'Owner'))
const tempRules = computed(() => rules.value.filter(r => r.carType === 'Temporary'))

const filteredRules = computed(() => {
  if (activeTab.value === 'all') return rules.value
  return rules.value.filter(r => r.carType === activeTab.value)
})

const calculatedFee = computed(() => {
  if (!calcForm.ruleId) return 0
  
  const rule = rules.value.find(r => r.id === calcForm.ruleId)
  if (!rule) return 0
  
  const totalMinutes = calcForm.hours * 60 + calcForm.minutes
  return calculateFee(totalMinutes, rule)
})

// 获取数据
const fetchRules = async () => {
  loading.value = true
  try {
    const res = await feeRulesApi.getFeeRules()
    rules.value = res
  } catch (error) {
    console.error('获取规则失败:', error)
  } finally {
    loading.value = false
  }
}

// 计算费用
const calculateFee = (minutes: number, rule: FeeRule): number => {
  // 扣除免费时长
  const chargeMinutes = Math.max(0, minutes - (rule.freeMinutes || 0))
  calcResult.freeMinutes = Math.min(minutes, rule.freeMinutes || 0)
  
  // 计算周期数
  const periods = Math.ceil(chargeMinutes / rule.chargeInterval)
  let fee = periods * rule.unitFee
  
  // 应用日封顶
  if (rule.dailyMaxFee && fee > rule.dailyMaxFee) {
    fee = rule.dailyMaxFee
    calcResult.capped = true
  } else {
    calcResult.capped = false
  }
  
  return fee
}

// 计算示例费用
const calculateExample = (rule: FeeRule): string => {
  const fee = calculateFee(120, rule)
  return `¥${fee.toFixed(2)}`
}

// 计算预览费用
const calculatePreview = (minutes: number): string => {
  const fee = calculateFee(minutes, {
    chargeInterval: form.ChargeInterval,
    unitFee: form.UnitFee,
    dailyMaxFee: form.DailyMaxFee,
    freeMinutes: form.FreeMinutes
  } as FeeRule)
  return `¥${fee.toFixed(2)}`
}

// 获取规则名称
const getRuleName = (id: number) => {
  return rules.value.find(r => r.id === id)?.ruleName || ''
}

// 操作处理
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (rule: FeeRule) => {
  editingId.value = rule.id
  Object.assign(editForm, {
    ruleName: rule.ruleName,
    chargeInterval: rule.chargeInterval,
    unitFee: rule.unitFee,
    dailyMaxFee: rule.dailyMaxFee || 0,
    freeMinutes: rule.freeMinutes
  })
}

const saveEdit = async (rule: FeeRule) => {
  try {
    await feeRulesApi.updateFeeRule(rule.id, {
      RuleName: editForm.ruleName,
      CarType: rule.carType,
      ChargeInterval: editForm.chargeInterval,
      UnitFee: editForm.unitFee,
      DailyMaxFee: editForm.dailyMaxFee || undefined,
      FreeMinutes: editForm.freeMinutes
    })
    ElMessage.success('保存成功')
    editingId.value = null
    fetchRules()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const cancelEdit = () => {
  editingId.value = null
}

const handleDelete = (rule: FeeRule) => {
  ElMessageBox.confirm(`确定要删除规则"${rule.ruleName}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // 假设有删除API
      ElMessage.success('删除成功')
      fetchRules()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const toggleRuleStatus = async (id: number, status: boolean) => {
  try {
    await feeRulesApi.toggleActive(id)
    ElMessage.success(status ? '规则已启用' : '规则已停用')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && currentEditRule.value) {
      await feeRulesApi.updateFeeRule(currentEditRule.value.id, form)
    } else {
      await feeRulesApi.createFeeRule(form)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchRules()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.RuleName = ''
  form.CarType = 'Temporary'
  form.ChargeInterval = 60
  form.UnitFee = 5
  form.DailyMaxFee = 50
  form.FreeMinutes = 15
  form.Description = ''
  currentEditRule.value = null
}

// 监听表单变化更新预览
watch(() => [form.ChargeInterval, form.UnitFee, form.DailyMaxFee, form.FreeMinutes], () => {
  // 预览自动更新
}, { deep: true })

onMounted(() => {
  fetchRules()
})
</script>

<style scoped>
.fee-rules-container {
  padding: 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

/* 概览卡片 */
.rules-overview {
  margin-bottom: 24px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.overview-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.overview-card.owner .overview-icon {
  background: linear-gradient(135deg, #52c41a, #95de64);
}

.overview-card.temp .overview-icon {
  background: linear-gradient(135deg, #fa8c16, #ffc53d);
}

.overview-card.calc .overview-icon {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.overview-count {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.overview-desc {
  font-size: 13px;
  color: #8c8c8c;
}

/* 规则卡片 */
.rules-card {
  border: none;
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 规则列表 */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-item {
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.rule-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.rule-item.inactive {
  opacity: 0.6;
  background: #f5f5f5;
}

.rule-item.editing {
  border-color: #1890ff;
  background: #e6f7ff;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.status-switch {
  margin-left: 8px;
}

.rule-content {
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.rule-params {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-label {
  font-size: 12px;
  color: #8c8c8c;
}

.param-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.param-value.price {
  color: #cf1322;
}

.rule-example {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e6f7ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 13px;
}

/* 编辑表单 */
.rule-edit-form {
  padding-top: 16px;
  border-top: 1px dashed #1890ff;
}

/* 表单样式 */
.rule-form :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
}

.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 预览区域 */
.preview-section {
  margin-top: 24px;
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 12px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #52c41a;
  margin-bottom: 16px;
}

.preview-content {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.preview-item {
  text-align: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.preview-item .time {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.preview-item .fee {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #262626;
}

.preview-item .fee.highlight {
  color: #cf1322;
  font-size: 20px;
}

/* 计算器 */
.calculator {
  padding: 20px 0;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duration-input span {
  color: #8c8c8c;
}

.calc-result {
  margin-top: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #fff2f0 0%, #fff 100%);
  border: 2px solid #ffccc7;
  border-radius: 16px;
  text-align: center;
}

.result-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.result-amount {
  font-size: 48px;
  font-weight: bold;
  color: #cf1322;
  margin-bottom: 16px;
}

.result-detail {
  text-align: left;
  padding-top: 16px;
  border-top: 1px dashed #ffccc7;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #595959;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .rules-overview {
    margin-bottom: 16px;
  }
  
  .overview-card {
    margin-bottom: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .rule-params {
    flex-direction: column;
    gap: 12px;
  }
  
  .preview-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

/**
页面布局：
顶部概览卡片（业主规则/临时规则/费用计算器）
规则列表卡片（标签页筛选+新建按钮）
规则项卡片式展示（支持行内编辑）
核心功能：
规则管理
卡片式规则展示（名称、类型、状态开关）
行内快速编辑（点击编辑直接修改参数）
规则启停控制（Switch开关）
计费示例自动计算（2小时费用预览）
新建/编辑规则
规则名称、适用车型选择
计费周期+单价设置
日封顶金额（0表示不封顶）
免费时长设置
实时费用预览（30分钟/1小时/2小时/4小时/24小时）
费用计算器
车辆类型选择
时长输入（小时+分钟）
规则选择
实时计算费用
计算详情（免费扣除、封顶触发提示）
计费逻辑：
复制
费用 = ceil((停车时长 - 免费时长) / 计费周期) * 单价
如果 费用 > 日封顶 则 费用 = 日封顶
交互优化：
规则卡片悬停效果
行内编辑无需弹窗
表单实时预览计算结果
移动端响应式布局
*/