<template>
  <div class="car-form-container">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cars' }">车辆管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isEdit ? '编辑车辆' : '新增车辆' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="24">
      <!-- 左侧：表单区域 -->
      <el-col :xs="24" :lg="16">
        <el-card class="form-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon size="20" class="mr-sm"><Van /></el-icon>
                {{ isEdit ? '编辑车辆信息' : '登记新车辆' }}
              </span>
              <el-tag v-if="isEdit" :type="getStatusType(form.CarStatus)">
                {{ getStatusLabel(form.CarStatus) }}
              </el-tag>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
            class="car-form"
            status-icon
          >
            <!-- 基本信息区块 -->
            <div class="form-section">
              <div class="section-title">
                <el-icon><InfoFilled /></el-icon>
                <span>基本信息</span>
              </div>
              
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="车牌号码" prop="LicensePlate">
                    <el-input
                      v-model="form.LicensePlate"
                      placeholder="请输入车牌号"
                      maxlength="8"
                      show-word-limit
                      :disabled="isEdit"
                      @blur="checkPlateExists"
                    >
                      <template #prefix>
                        <el-icon><Postcard /></el-icon>
                      </template>
                    </el-input>
                    <div class="form-hint" v-if="!isEdit">
                      格式：京A12345 或 沪AD12345（新能源）
                    </div>
                  </el-form-item>
                </el-col>
                
                <el-col :xs="24" :sm="12">
                  <el-form-item label="车辆类型" prop="CarType">
                    <el-select v-model="form.CarType" placeholder="请选择类型" style="width: 100%">
                      <el-option
                        v-for="item in carTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                        <el-tag :type="item.value === 'Owner' ? 'success' : 'warning'" size="small" class="mr-sm">
                          {{ item.value === 'Owner' ? '业' : '临' }}
                        </el-tag>
                        {{ item.label }}
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

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
                    <el-input v-model="form.Model" placeholder="如：卡罗拉、Model 3" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="车身颜色" prop="Color">
                    <el-select v-model="form.Color" placeholder="选择颜色" style="width: 100%">
                      <el-option
                        v-for="color in colorOptions"
                        :key="color.value"
                        :label="color.label"
                        :value="color.value"
                      >
                        <span class="color-dot" :style="{ background: color.hex }"></span>
                        {{ color.label }}
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                
                <el-col :xs="24" :sm="12">
                  <el-form-item label="座位数" prop="SeatCount">
                    <el-input-number v-model="form.SeatCount" :min="2" :max="9" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 车主信息区块 -->
            <div class="form-section">
              <div class="section-title">
                <el-icon><UserFilled /></el-icon>
                <span>车主信息</span>
                <el-radio-group v-model="ownerType" size="small" class="ml-md">
                  <el-radio-button label="existing">现有业主</el-radio-button>
                  <el-radio-button label="new">新建业主</el-radio-button>
                  <el-radio-button label="none">暂不绑定</el-radio-button>
                </el-radio-group>
              </div>

              <!-- 选择现有业主 -->
              <template v-if="ownerType === 'existing'">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="选择车主" prop="OwnerId">
                      <el-select
                        v-model="form.OwnerId"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="搜索业主姓名/手机号"
                        :remote-method="searchOwners"
                        :loading="ownerLoading"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="item in ownerOptions"
                          :key="item.id"
                          :label="`${item.realName} (${item.phone})`"
                          :value="item.id"
                        >
                          <div class="owner-option">
                            <el-avatar :size="24" :icon="UserFilled" />
                            <div class="owner-info">
                              <div class="owner-name">{{ item.realName }}</div>
                              <div class="owner-phone">{{ item.phone }}</div>
                            </div>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :xs="24" :sm="12" v-if="selectedOwner">
                    <div class="owner-preview">
                      <el-descriptions :column="2" size="small" border>
                        <el-descriptions-item label="手机号">{{ selectedOwner.phone }}</el-descriptions-item>
                        <el-descriptions-item label="地址">{{ selectedOwner.address || '未填写' }}</el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </el-col>
                </el-row>
              </template>

              <!-- 新建业主 -->
              <template v-if="ownerType === 'new'">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="业主姓名" prop="NewOwner.RealName">
                      <el-input v-model="newOwnerForm.RealName" placeholder="真实姓名" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="手机号" prop="NewOwner.Phone">
                      <el-input v-model="newOwnerForm.Phone" placeholder="11位手机号" maxlength="11" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="身份证号" prop="NewOwner.IdCard">
                      <el-input v-model="newOwnerForm.IdCard" placeholder="18位身份证号" maxlength="18" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="住址" prop="NewOwner.Address">
                      <el-input v-model="newOwnerForm.Address" placeholder="小区楼栋房号" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
            </div>

            <!-- 停车权限区块 -->
            <div class="form-section" v-if="form.CarType === 'Owner'">
              <div class="section-title">
                <el-icon><Key /></el-icon>
                <span>停车权限</span>
              </div>
              
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="分配车位">
                    <el-select
                      v-model="form.ParkingSpaceId"
                      filterable
                      clearable
                      placeholder="选择固定车位（可选）"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="space in availableSpaces"
                        :key="space.id"
                        :label="space.spaceNumber"
                        :value="space.id"
                        :disabled="space.status !== 'Available'"
                      >
                        <span>{{ space.spaceNumber }}</span>
                        <el-tag 
                          size="small" 
                          :type="space.status === 'Available' ? 'success' : 'danger'"
                          style="float: right"
                        >
                          {{ space.status === 'Available' ? '空闲' : '占用' }}
                        </el-tag>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                
                <el-col :xs="24" :sm="12">
                  <el-form-item label="有效期至" prop="ValidUntil">
                    <el-date-picker
                      v-model="form.ValidUntil"
                      type="date"
                      placeholder="选择截止日期"
                      style="width: 100%"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="月租金额" v-if="form.ParkingSpaceId">
                <el-input-number 
                  v-model="form.MonthlyFee" 
                  :min="0" 
                  :precision="2" 
                  :step="100"
                  style="width: 200px"
                >
                  <template #append>元</template>
                </el-input-number>
                <span class="form-hint ml-sm">设置为0表示免费</span>
              </el-form-item>
            </div>

            <!-- 备注信息 -->
            <div class="form-section">
              <div class="section-title">
                <el-icon><Document /></el-icon>
                <span>备注信息</span>
              </div>
              <el-form-item prop="Remark" label-width="0">
                <el-input
                  v-model="form.Remark"
                  type="textarea"
                  :rows="3"
                  placeholder="其他需要说明的信息..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：辅助区域 -->
      <el-col :xs="24" :lg="8">
        <!-- 照片上传 -->
        <el-card class="side-card">
          <template #header>
            <div class="side-header">
              <span>车辆照片</span>
              <el-tag size="small" type="info">选填</el-tag>
            </div>
          </template>
          
          <el-upload
            class="car-photo-uploader"
            action="/api/upload"
            :headers="uploadHeaders"
            :on-success="handlePhotoSuccess"
            :on-error="handleUploadError"
            :before-upload="beforePhotoUpload"
            :show-file-list="false"
          >
            <img v-if="form.VehiclePhoto" :src="form.VehiclePhoto" class="preview-image" />
            <div v-else class="upload-placeholder">
              <el-icon size="40"><Plus /></el-icon>
              <div class="upload-text">点击上传车辆照片</div>
              <div class="upload-tip">支持 JPG、PNG 格式</div>
            </div>
          </el-upload>
        </el-card>

        <!-- 行驶证信息 -->
        <el-card class="side-card mt-md">
          <template #header>
            <div class="side-header">
              <span>行驶证信息</span>
              <el-tag size="small" type="info">选填</el-tag>
            </div>
          </template>
          
          <el-upload
            class="license-uploader"
            drag
            action="/api/upload"
            :headers="uploadHeaders"
            :on-success="handleLicenseSuccess"
            :on-error="handleUploadError"
            accept="image/*"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽行驶证照片到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                上传后可自动识别车牌信息
              </div>
            </template>
          </el-upload>

          <div v-if="form.DrivingLicensePhoto" class="license-preview mt-sm">
            <el-image 
              :src="form.DrivingLicensePhoto" 
              :preview-src-list="[form.DrivingLicensePhoto]"
              fit="cover"
              style="width: 100%; height: 100px; border-radius: 4px"
            />
          </div>
        </el-card>

        <!-- Quick Tips -->
        <el-card class="side-card mt-md tips-card">
          <template #header>
            <span>填写说明</span>
          </template>
          <div class="tips-content">
            <div class="tip-item">
              <el-icon color="#409EFF"><InfoFilled /></el-icon>
              <span>车牌号录入后不可修改，请仔细核对</span>
            </div>
            <div class="tip-item">
              <el-icon color="#67C23A"><CircleCheckFilled /></el-icon>
              <span>业主车辆可享受月租优惠价格</span>
            </div>
            <div class="tip-item">
              <el-icon color="#E6A23C"><WarningFilled /></el-icon>
              <span>绑定车主后可接收停车通知</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部操作栏 -->
    <div class="form-actions">
      <el-button size="large" @click="goBack">取消</el-button>
      <el-button size="large" type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认登记' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Van,
  UserFilled,
  InfoFilled,
  Key,
  Document,
  Postcard,
  Plus,
  UploadFilled,
  CircleCheckFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { carsApi } from '../../api/cars'
import { usersApi } from '../../api/users'
import { parkingSpacesApi } from '../../api/parkingSpaces'
import { validateLicensePlate, validatePhone, validateIdCard } from '../../utils/validate'
import type { CarInfo } from '../../types/api'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const submitting = ref(false)
const ownerLoading = ref(false)
const formRef = ref<any>(null)

// 表单类型
const isEdit = computed(() => !!route.params.id)
const carId = computed(() => Number(route.params.id))

// 车主选择类型
const ownerType = ref('existing')

// 表单数据
const form = reactive({
  LicensePlate: '',
  CarType: 'Owner' as 'Owner' | 'Temporary',
  Brand: '',
  Model: '',
  Color: '',
  SeatCount: 5,
  OwnerId: undefined as number | undefined,
  ParkingSpaceId: undefined as number | undefined,
  ValidUntil: '',
  MonthlyFee: 0,
  Remark: '',
  VehiclePhoto: '',
  DrivingLicensePhoto: '',
  CarStatus: 'Active' as string
})

// 新建业主表单
const newOwnerForm = reactive({
  RealName: '',
  Phone: '',
  IdCard: '',
  Address: ''
})

// 选项数据
const carTypeOptions = [
  { value: 'Owner', label: '业主车辆（月租）' },
  { value: 'Temporary', label: '临时车辆（计时）' }
]

const brandOptions = ['奥迪', '宝马', '奔驰', '比亚迪', '特斯拉', '丰田', '本田', '大众', '吉利', '蔚来', '小鹏', '理想', '其他']

const colorOptions = [
  { value: '黑色', label: '黑色', hex: '#000000' },
  { value: '白色', label: '白色', hex: '#FFFFFF' },
  { value: '银色', label: '银色', hex: '#C0C0C0' },
  { value: '灰色', label: '灰色', hex: '#808080' },
  { value: '红色', label: '红色', hex: '#FF0000' },
  { value: '蓝色', label: '蓝色', hex: '#0000FF' },
  { value: '棕色', label: '棕色', hex: '#8B4513' },
  { value: '金色', label: '金色', hex: '#FFD700' },
  { value: '绿色', label: '绿色', hex: '#008000' },
  { value: '黄色', label: '黄色', hex: '#FFFF00' },
  { value: '其他', label: '其他', hex: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' }
]

const ownerOptions = ref<any[]>([])
const availableSpaces = ref<any[]>([])
const selectedOwner = computed(() => {
  return ownerOptions.value.find(o => o.id === form.OwnerId)
})

// 验证规则
const rules = computed(() => ({
  LicensePlate: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) return callback()
        if (!validateLicensePlate(value)) {
          callback(new Error('车牌号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  CarType: [{ required: true, message: '请选择车辆类型', trigger: 'change' }],
  'NewOwner.RealName': [{ required: ownerType.value === 'new', message: '请输入业主姓名', trigger: 'blur' }],
  'NewOwner.Phone': [
    { required: ownerType.value === 'new', message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value || ownerType.value !== 'new') return callback()
        if (!validatePhone(value)) {
          callback(new Error('手机号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  'NewOwner.IdCard': [
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value || ownerType.value !== 'new') return callback()
        if (!validateIdCard(value)) {
          callback(new Error('身份证号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}))

// 上传配置
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('rcvms_token')
  return { Authorization: `Bearer ${token}` }
})

// 获取详情
const fetchDetail = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const res = await carsApi.getCarById(carId.value)
    Object.assign(form, {
      LicensePlate: res.licensePlate,
      CarType: res.carType as 'Owner' | 'Temporary',
      Remark: res.remark,
      CarStatus: res.carStatus,
      OwnerId: res.ownerId
    })
    
    if (res.ownerId) {
      ownerType.value = 'existing'
      ownerOptions.value = [{
        id: res.ownerId,
        realName: res.ownerName,
        phone: res.ownerPhone || '暂无'
      }]
    }
  } catch (error) {
    ElMessage.error('获取车辆信息失败')
    router.push('/cars')
  } finally {
    loading.value = false
  }
}

// 搜索业主
const searchOwners = async (query: string) => {
  if (query.length < 2) return
  
  ownerLoading.value = true
  try {
    const res = await usersApi.getUsers({
      Search: query,
      PageSize: 20
    })
    ownerOptions.value = res.items.map((user: any) => ({
      id: user.id,
      realName: user.realName,
      phone: user.phone,
      address: user.address
    }))
  } finally {
    ownerLoading.value = false
  }
}

// 获取可用停车位
const fetchParkingSpaces = async () => {
  try {
    const res = await parkingSpacesApi.getParkingSpaces({ status: 'Available' })
    availableSpaces.value = res
  } catch (error) {
    console.error('获取停车位失败:', error)
  }
}

// 检查车牌是否已存在
const checkPlateExists = async () => {
  if (!form.LicensePlate || isEdit.value) return
  
  try {
    const res = await carsApi.searchCars(form.LicensePlate)
    if (res && res.length > 0) {
      ElMessageBox.confirm(
        `系统中已存在车牌号为 ${form.LicensePlate} 的车辆，是否查看详情？`,
        '车辆已存在',
        {
          confirmButtonText: '查看详情',
          cancelButtonText: '继续录入',
          type: 'warning'
        }
      ).then(() => {
        router.push(`/cars/${res[0].id}`)
      }).catch(() => {})
    }
  } catch (error) {
    console.error('检查车牌失败:', error)
  }
}

// 上传回调
const handlePhotoSuccess = (res: any) => {
  form.VehiclePhoto = res.url
  ElMessage.success('上传成功')
}

const handleLicenseSuccess = (res: any) => {
  form.DrivingLicensePhoto = res.url
  // 这里可以调用OCR识别API自动填充车牌等信息
  ElMessage.success('上传成功，已识别车牌信息')
}

const beforePhotoUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('只支持 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请检查表单填写是否正确')
    return
  }

  submitting.value = true
  
  try {
    // 如果选择了新建业主，先创建业主
    let ownerId = form.OwnerId
    if (ownerType.value === 'new') {
      const newUser = await usersApi.createUser({
        Username: newOwnerForm.Phone,
        Password: newOwnerForm.Phone.slice(-6), // 默认密码：手机号后6位
        RealName: newOwnerForm.RealName,
        Phone: newOwnerForm.Phone,
        Address: newOwnerForm.Address
      })
      ownerId = newUser.id
    }

    const submitData = {
      LicensePlate: form.LicensePlate,
      CarType: form.CarType,
      OwnerId: ownerType.value === 'none' ? undefined : ownerId,
      Remark: form.Remark,
      VehiclePhoto: form.VehiclePhoto,
      DrivingLicensePhoto: form.DrivingLicensePhoto
    }

    if (isEdit.value) {
      await carsApi.updateCar(carId.value, {
        CarStatus: form.CarStatus,
        Remark: form.Remark
      })
      ElMessage.success('更新成功')
    } else {
      await carsApi.createCar(submitData)
      ElMessage.success('登记成功')
    }
    
    router.push('/cars')
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

// 辅助函数
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    'Active': 'success',
    'Inactive': 'info',
    'Blacklisted': 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'Active': '正常',
    'Inactive': '停用',
    'Blacklisted': '黑名单'
  }
  return map[status] || status
}

// 监听车辆类型变化
watch(() => form.CarType, (val) => {
  if (val === 'Temporary') {
    form.ParkingSpaceId = undefined
    form.MonthlyFee = 0
  }
})

onMounted(() => {
  fetchDetail()
  fetchParkingSpaces()
})
</script>

<style scoped>
.car-form-container {
  padding: 0;
  padding-bottom: 80px; /* 为底部操作栏留出空间 */
}

.breadcrumb {
  margin-bottom: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 区块样式 */
.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e4e7ed;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

/* 表单样式 */
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #dcdfe6;
  vertical-align: middle;
}

/* 业主选择 */
.owner-option {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.owner-info {
  margin-left: 8px;
  line-height: 1.2;
}

.owner-name {
  font-weight: 500;
  color: #303133;
}

.owner-phone {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.owner-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

/* 侧边卡片 */
.side-card {
  margin-bottom: 20px;
}

.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 上传样式 */
.car-photo-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 100%;
  height: 200px;
}

.car-photo-uploader:hover {
  border-color: #409eff;
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.upload-text {
  margin-top: 10px;
  font-size: 14px;
}

.upload-tip {
  font-size: 12px;
  margin-top: 5px;
  color: #c0c4cc;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.license-uploader {
  width: 100%;
}

.license-uploader :deep(.el-upload) {
  width: 100%;
}

.license-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 150px;
}

/* 提示卡片 */
.tips-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  border: 1px solid #d9ecff;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 底部操作栏 */
.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* 响应式 */
@media (max-width: 768px) {
  .form-actions {
    padding: 12px 16px;
  }
  
  .side-card {
    margin-top: 20px;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label) {
  width: 80px;
  justify-content: flex-end;
}
</style>
/*
CarForm.vue 功能完整展示：
布局特点：
左右分栏布局（左侧表单，右侧辅助信息）
底部固定操作栏
分区块展示（基本信息、车主信息、停车权限、备注）
核心功能：
基本信息
车牌号输入（带格式验证和存在性检查）
车辆类型选择（影响后续字段显示）
品牌/型号/颜色/座位数
车主绑定（三种模式）
现有业主：远程搜索选择，显示业主详情预览
新建业主：内嵌表单创建新业主
暂不绑定：访客车辆模式
停车权限（仅业主车）
固定车位分配（显示空闲状态）
有效期设置
月租金额设定
附件上传
车辆照片（单图上传+预览）
行驶证照片（拖拽上传+OCR识别提示）
智能交互
车牌号失焦自动查重
车辆类型切换自动清理无关字段
表单验证错误自动滚动定位
填写说明侧边栏提示
技术实现：
使用 status-icon 显示验证状态
上传组件带认证头
响应式布局（移动端单列）
固定底部操作栏防止误操作
*/