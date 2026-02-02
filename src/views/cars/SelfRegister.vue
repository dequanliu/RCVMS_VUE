<template>
  <div class="self-register-container">
    <!-- 顶部导航 -->
    <div class="register-header">
      <div class="header-content">
        <div class="brand">
          <el-icon size="32" color="#409EFF"><Van /></el-icon>
          <span class="brand-text">小区车辆登记</span>
        </div>
        <div class="header-actions">
          <el-button link @click="goToLogin">
            已有账户？去登录 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div class="register-main">
      <!-- 步骤指示器 -->
      <div class="steps-wrapper">
        <el-steps :active="activeStep" finish-status="success" simple>
          <el-step title="车辆信息" :icon="Van" />
          <el-step title="证件上传" :icon="Upload" />
          <el-step title="联系方式" :icon="User" />
          <el-step title="完成登记" :icon="CircleCheck" />
        </el-steps>
      </div>

      <div class="form-container">
        <!-- 步骤1：车辆信息 -->
        <div v-if="activeStep === 0" class="step-content animate-fade-in">
          <div class="step-title">
            <h3>请输入车辆信息</h3>
            <p class="text-secondary">请确保车牌号准确无误，这将作为进出小区的识别凭证</p>
          </div>

          <el-form
            ref="formRef1"
            :model="form"
            :rules="rules1"
            label-position="top"
            size="large"
          >
            <el-form-item label="车牌号码" prop="LicensePlate" class="plate-item">
              <div class="plate-input-wrapper">
                <el-input
                  v-model="form.LicensePlate"
                  placeholder="如：京A12345"
                  maxlength="8"
                  class="plate-input"
                >
                  <template #prefix>
                    <el-icon><Postcard /></el-icon>
                  </template>
                  <template #append>
                    <el-button @click="triggerOCR" :icon="Camera">拍照识别</el-button>
                  </template>
                </el-input>
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/*" 
                  style="display: none" 
                  @change="handleOCRUpload"
                >
              </div>
              <div class="input-hint">
                <el-icon><InfoFilled /></el-icon>
                <span>支持普通车牌和新能源车牌，区分大小写</span>
              </div>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="车辆品牌" prop="Brand">
                  <el-select
                    v-model="form.Brand"
                    filterable
                    allow-create
                    placeholder="选择或输入品牌"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="brand in brandOptions"
                      :key="brand"
                      :label="brand"
                      :value="brand"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="车辆型号" prop="Model">
                  <el-input v-model="form.Model" placeholder="如：卡罗拉 2023款" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="车身颜色" prop="Color">
              <div class="color-selector">
                <div
                  v-for="color in colorOptions"
                  :key="color.value"
                  class="color-option"
                  :class="{ active: form.Color === color.value }"
                  @click="form.Color = color.value"
                >
                  <span class="color-circle" :style="{ background: color.hex }"></span>
                  <span class="color-name">{{ color.label }}</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="车辆类型" prop="CarType">
              <el-radio-group v-model="form.CarType" size="large">
                <el-radio-button label="Owner">
                  <el-icon><HomeFilled /></el-icon>
                  <div class="radio-label">业主车辆</div>
                  <div class="radio-desc">小区业主固定车位</div>
                </el-radio-button>
                <el-radio-button label="Temporary">
                  <el-icon><Timer /></el-icon>
                  <div class="radio-label">访客车辆</div>
                  <div class="radio-desc">临时停车计时收费</div>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <div class="step-actions">
            <el-button type="primary" size="large" @click="nextStep(1)" class="next-btn">
              下一步 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 步骤2：证件上传 -->
        <div v-if="activeStep === 1" class="step-content animate-fade-in">
          <div class="step-title">
            <h3>上传车辆证件</h3>
            <p class="text-secondary">上传清晰的证件照片有助于快速审核通过</p>
          </div>

          <el-row :gutter="30">
            <el-col :xs="24" :sm="12">
              <div class="upload-card" :class="{ 'has-file': form.VehiclePhoto }">
                <div class="upload-header">
                  <span class="upload-title">车辆照片</span>
                  <el-tag v-if="form.VehiclePhoto" type="success">已上传</el-tag>
                </div>
                
                <el-upload
                  class="photo-uploader"
                  action="/api/upload"
                  :headers="uploadHeaders"
                  :on-success="handleVehiclePhotoSuccess"
                  :before-upload="beforeUpload"
                  :show-file-list="false"
                  drag
                >
                  <img v-if="form.VehiclePhoto" :src="form.VehiclePhoto" class="uploaded-image" />
                  <div v-else class="upload-placeholder">
                    <el-icon size="48" color="#dcdfe6"><Plus /></el-icon>
                    <div class="upload-text">点击或拖拽上传车辆照片</div>
                    <div class="upload-tip">支持 JPG、PNG，大小不超过 5MB</div>
                  </div>
                </el-upload>
                
                <div class="upload-example" v-if="!form.VehiclePhoto">
                  <el-image src="/example-car.jpg" fit="cover" class="example-image" />
                  <span class="example-text">示例：包含车牌的正面照片</span>
                </div>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12">
              <div class="upload-card" :class="{ 'has-file': form.DrivingLicensePhoto }">
                <div class="upload-header">
                  <span class="upload-title">行驶证照片</span>
                  <el-tag v-if="form.DrivingLicensePhoto" type="success">已上传</el-tag>
                  <span v-else class="optional-tag">选填</span>
                </div>
                
                <el-upload
                  class="photo-uploader"
                  action="/api/upload"
                  :headers="uploadHeaders"
                  :on-success="handleLicenseSuccess"
                  :before-upload="beforeUpload"
                  :show-file-list="false"
                  drag
                >
                  <img v-if="form.DrivingLicensePhoto" :src="form.DrivingLicensePhoto" class="uploaded-image" />
                  <div v-else class="upload-placeholder">
                    <el-icon size="48" color="#dcdfe6"><Document /></el-icon>
                    <div class="upload-text">点击或拖拽上传行驶证</div>
                    <div class="upload-tip">上传后可自动识别车牌信息</div>
                  </div>
                </el-upload>
                
                <div class="upload-hint" v-if="!form.DrivingLicensePhoto">
                  <el-icon color="#e6a23c"><Warning /></el-icon>
                  <span>行驶证用于验证车辆信息，建议上传</span>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">上一步</el-button>
            <el-button type="primary" size="large" @click="nextStep(2)" class="next-btn">
              下一步 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 步骤3：联系方式 -->
        <div v-if="activeStep === 2" class="step-content animate-fade-in">
          <div class="step-title">
            <h3>填写联系方式</h3>
            <p class="text-secondary">用于接收停车通知和验证码</p>
          </div>

          <el-form
            ref="formRef3"
            :model="contactForm"
            :rules="rules3"
            label-position="top"
            size="large"
          >
            <el-form-item label="联系人姓名" prop="RealName">
              <el-input v-model="contactForm.RealName" placeholder="请输入真实姓名" maxlength="20">
                <template #prefix><el-icon><User /></el-icon></template>
              </el-input>
            </el-form-item>

            <el-form-item label="手机号码" prop="Phone">
              <el-input 
                v-model="contactForm.Phone" 
                placeholder="11位手机号码" 
                maxlength="11"
              >
                <template #prefix><el-icon><Iphone /></el-icon></template>
              </el-input>
            </el-form-item>

            <el-form-item label="验证码" prop="VerifyCode">
              <div class="verify-code-wrapper">
                <el-input 
                  v-model="contactForm.VerifyCode" 
                  placeholder="请输入验证码" 
                  maxlength="6"
                  class="code-input"
                >
                  <template #prefix><el-icon><Lock /></el-icon></template>
                </el-input>
                <el-button 
                  type="primary" 
                  :disabled="countdown > 0"
                  @click="sendVerifyCode"
                  class="send-btn"
                >
                  {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="agreement">
                我已阅读并同意 <el-button link type="primary">《停车服务协议》</el-button> 和 
                <el-button link type="primary">《隐私政策》</el-button>
              </el-checkbox>
            </el-form-item>
          </el-form>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">上一步</el-button>
            <el-button 
              type="primary" 
              size="large" 
              @click="submitRegistration" 
              class="next-btn"
              :loading="submitting"
              :disabled="!agreement"
            >
              提交登记
            </el-button>
          </div>
        </div>

        <!-- 步骤4：完成 -->
        <div v-if="activeStep === 3" class="step-content result-step animate-fade-in">
          <el-result
            :icon="submitSuccess ? 'success' : 'error'"
            :title="submitSuccess ? '登记提交成功' : '提交失败'"
            :sub-title="resultMessage"
          >
            <template #extra>
              <div class="result-actions">
                <template v-if="submitSuccess">
                  <div class="success-info">
                    <div class="info-item">
                      <span class="label">车牌号：</span>
                      <span class="value highlight">{{ form.LicensePlate }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">审核状态：</span>
                      <el-tag type="warning">审核中</el-tag>
                    </div>
                    <div class="info-item">
                      <span class="label">预计审核时间：</span>
                      <span class="value">1-2个工作日</span>
                    </div>
                  </div>
                  
                  <div class="action-buttons">
                    <el-button type="primary" @click="viewMyCars">查看我的车辆</el-button>
                    <el-button @click="registerAnother">继续登记其他车辆</el-button>
                  </div>
                  
                  <div class="tips-card">
                    <div class="tips-title">
                      <el-icon><InfoFilled /></el-icon>
                      温馨提示
                    </div>
                    <ul class="tips-list">
                      <li>审核通过前，车辆可按临时车进出</li>
                      <li>审核结果将以短信形式通知您</li>
                      <li>如有疑问请联系物业：400-xxx-xxxx</li>
                    </ul>
                  </div>
                </template>
                
                <template v-else>
                  <el-button type="primary" @click="retrySubmit">重新提交</el-button>
                  <el-button @click="goToHome">返回首页</el-button>
                </template>
              </div>
            </template>
          </el-result>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="register-footer">
      <p>© 2024 小区车辆管理系统 | 技术支持：RCVMS Team</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Van,
  ArrowRight,
  Postcard,
  Camera,
  InfoFilled,
  HomeFilled,
  Timer,
  Plus,
  Document,
  Warning,
  User,
  Iphone,
  Lock,
  CircleCheck,
  Upload
} from '@element-plus/icons-vue'
import { carsApi } from '../../api/cars'
import { validateLicensePlate, validatePhone } from '../../utils/validate'

const router = useRouter()

// 状态
const activeStep = ref(0)
const submitting = ref(false)
const submitSuccess = ref(false)
const resultMessage = ref('')
const agreement = ref(false)
const countdown = ref(0)
const fileInput = ref<HTMLInputElement>()

// 表单数据
const form = reactive({
  LicensePlate: '',
  Brand: '',
  Model: '',
  Color: '',
  CarType: 'Owner' as 'Owner' | 'Temporary',
  VehiclePhoto: '',
  DrivingLicensePhoto: '',
  Remark: ''
})

const contactForm = reactive({
  RealName: '',
  Phone: '',
  VerifyCode: ''
})

// 验证规则
const rules1 = {
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
  Brand: [{ required: true, message: '请选择或输入品牌', trigger: 'change' }],
  Color: [{ required: true, message: '请选择车身颜色', trigger: 'change' }],
  CarType: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
}

const rules3 = {
  RealName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  Phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!validatePhone(value)) {
          callback(new Error('手机号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  VerifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 选项数据
const brandOptions = ['奥迪', '宝马', '奔驰', '比亚迪', '特斯拉', '丰田', '本田', '大众', '吉利', '蔚来', '小鹏', '理想', '长城', '五菱', '其他']

const colorOptions = [
  { value: '黑色', label: '黑色', hex: '#1a1a1a' },
  { value: '白色', label: '白色', hex: '#ffffff' },
  { value: '银色', label: '银色', hex: '#c0c0c0' },
  { value: '灰色', label: '灰色', hex: '#808080' },
  { value: '红色', label: '红色', hex: '#dc143c' },
  { value: '蓝色', label: '蓝色', hex: '#4169e1' },
  { value: '棕色', label: '棕色', hex: '#8b4513' },
  { value: '金色', label: '金色', hex: '#ffd700' },
  { value: '绿色', label: '绿色', hex: '#228b22' },
  { value: '橙色', label: '橙色', hex: '#ff8c00' }
]

// 上传配置
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('rcvms_token')
  return { Authorization: `Bearer ${token}` }
})

// 步骤控制
const nextStep = async (step: number) => {
  if (step === 1) {
    const formRef = document.querySelector('form')
    // 简单验证演示
    if (!form.LicensePlate || !form.Brand || !form.Color) {
      ElMessage.warning('请填写完整的车辆信息')
      return
    }
    if (!validateLicensePlate(form.LicensePlate)) {
      ElMessage.error('车牌号格式不正确')
      return
    }
  }
  
  if (step === 2 && !form.VehiclePhoto) {
    ElMessage.warning('请上传车辆照片')
    return
  }
  
  activeStep.value = step
}

const prevStep = () => {
  activeStep.value--
}

// OCR识别
const triggerOCR = () => {
  fileInput.value?.click()
}

const handleOCRUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // 模拟OCR识别
  ElMessage.info('正在识别车牌...')
  setTimeout(() => {
    form.LicensePlate = '京A88888' // 模拟识别结果
    form.Brand = '奥迪'
    form.Model = 'A6L'
    ElMessage.success('识别成功，请核对信息')
  }, 1500)
}

// 上传处理
const beforeUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isJPG) {
    ElMessage.error('只支持 JPG/PNG 格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleVehiclePhotoSuccess = (res: any) => {
  form.VehiclePhoto = res.url
  ElMessage.success('上传成功')
}

const handleLicenseSuccess = (res: any) => {
  form.DrivingLicensePhoto = res.url
  ElMessage.success('行驶证上传成功')
  
  // 模拟自动识别
  if (!form.LicensePlate) {
    setTimeout(() => {
      form.LicensePlate = '京A88888'
      ElMessage.success('已自动识别车牌信息')
    }, 1000)
  }
}

// 验证码
const sendVerifyCode = () => {
  if (!validatePhone(contactForm.Phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  ElMessage.success('验证码已发送（演示：123456）')
  contactForm.VerifyCode = '123456' // 演示自动填充
}

// 提交登记
const submitRegistration = async () => {
  if (!contactForm.RealName || !contactForm.Phone || !contactForm.VerifyCode) {
    ElMessage.warning('请填写完整的联系方式')
    return
  }
  
  if (!agreement.value) {
    ElMessage.warning('请阅读并同意服务协议')
    return
  }
  
  submitting.value = true
  
  try {
    await carsApi.selfRegister({
      LicensePlate: form.LicensePlate,
      Brand: form.Brand,
      Model: form.Model,
      Color: form.Color,
      Remark: `联系人：${contactForm.RealName}，电话：${contactForm.Phone}`,
      VehiclePhoto: form.VehiclePhoto,
      DrivingLicensePhoto: form.DrivingLicensePhoto
    })
    
    submitSuccess.value = true
    resultMessage.value = '您的车辆登记申请已提交，请等待审核'
    activeStep.value = 3
  } catch (error) {
    submitSuccess.value = false
    resultMessage.value = '提交失败，请检查网络后重试'
    activeStep.value = 3
  } finally {
    submitting.value = false
  }
}

// 结果页操作
const viewMyCars = () => {
  router.push('/fees/my-records')
}

const registerAnother = () => {
  // 重置表单
  Object.assign(form, {
    LicensePlate: '',
    Brand: '',
    Model: '',
    Color: '',
    VehiclePhoto: '',
    DrivingLicensePhoto: ''
  })
  Object.assign(contactForm, {
    RealName: '',
    Phone: '',
    VerifyCode: ''
  })
  agreement.value = false
  activeStep.value = 0
}

const retrySubmit = () => {
  activeStep.value = 2
}

const goToHome = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.self-register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  padding-bottom: 60px;
}

/* 顶部导航 */
.register-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

/* 主体内容 */
.register-main {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.steps-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.form-container {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

.step-title {
  text-align: center;
  margin-bottom: 40px;
}

.step-title h3 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.step-title p {
  color: #606266;
  font-size: 14px;
}

/* 步骤1：车辆信息 */
.plate-input-wrapper {
  position: relative;
}

.plate-input :deep(.el-input__inner) {
  font-size: 24px;
  letter-spacing: 2px;
  font-weight: bold;
  text-transform: uppercase;
}

.input-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.color-option:hover {
  background: #f5f7fa;
}

.color-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e4e7ed;
  box-shadow: inset 0 0 0 2px #fff;
}

.color-name {
  font-size: 12px;
  color: #606266;
}

/* 单选按钮样式 */
:deep(.el-radio-button__inner) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  height: auto;
  gap: 8px;
}

.radio-label {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}

.radio-desc {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

/* 步骤2：证件上传 */
.upload-card {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-card:hover {
  border-color: #409eff;
}

.upload-card.has-file {
  border-color: #67c23a;
  border-style: solid;
  background: #f6ffed;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.upload-title {
  font-weight: 600;
  color: #303133;
}

.optional-tag {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.photo-uploader {
  width: 100%;
}

.photo-uploader :deep(.el-upload) {
  width: 100%;
}

.photo-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  border: none;
  background: transparent;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.upload-text {
  margin-top: 12px;
  font-size: 14px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #c0c4cc;
}

.uploaded-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-example {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.example-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.example-text {
  font-size: 12px;
  color: #606266;
}

.upload-hint {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e6a23c;
  font-size: 13px;
  padding: 8px 12px;
  background: #fdf6ec;
  border-radius: 6px;
}

/* 步骤3：联系方式 */
.verify-code-wrapper {
  display: flex;
  gap: 12px;
}

.code-input {
  flex: 1;
}

.send-btn {
  width: 140px;
}

/* 步骤4：结果 */
.result-step {
  padding: 40px 0;
}

.success-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #d9f7be;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #595959;
}

.info-item .value {
  color: #262626;
  font-weight: 500;
}

.info-item .value.highlight {
  color: #1890ff;
  font-size: 18px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.tips-card {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-weight: 600;
  margin-bottom: 12px;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  color: #595959;
  font-size: 13px;
  line-height: 2;
}

/* 步骤操作按钮 */
.step-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.next-btn {
  min-width: 140px;
}

/* 动画 */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 底部 */
.register-footer {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin-top: 60px;
  padding: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .register-main {
    margin: 20px auto;
  }
  
  .form-container {
    padding: 24px;
  }
  
  .step-title h3 {
    font-size: 20px;
  }
  
  .color-selector {
    gap: 8px;
  }
  
  .color-option {
    padding: 6px 8px;
  }
  
  .step-actions {
    flex-direction: column-reverse;
  }
  
  .step-actions .el-button {
    width: 100%;
  }
}
</style>
/*
SelfRegister.vue 特点：
用户体验优化：
分步向导：4步流程（车辆信息→证件上传→联系方式→完成），降低认知负担
视觉反馈：颜色选择可视化、已上传文件状态标识、步骤动画过渡
智能辅助：OCR拍照识别车牌、行驶证自动识别、验证码自动填充（演示）
功能完整：
车辆信息：车牌输入（大写转换）、品牌型号、颜色选择器、车辆类型选择
证件上传：拖拽上传、格式/大小验证、示例图片提示
联系方式：手机号验证、倒计时验证码、服务协议确认
结果反馈：成功/失败状态页、审核信息展示、快捷操作按钮
界面设计：
渐变背景营造轻松氛围
卡片式布局清晰分区
移动端底部按钮全宽适配
顶部粘性导航方便返回
*/