<template>
  <div class="register-page">
    <div class="bg-animation">
      <div class="bg-gradient"></div>
      <ul class="circles">
        <li v-for="i in 10" :key="i"></li>
      </ul>
    </div>

    <div class="register-container">
      <div class="register-box">
        <div class="form-header">
          <el-icon size="40" color="#409EFF"><CirclePlusFilled /></el-icon>
          <h2>创建账户</h2>
          <p>请填写以下信息完成注册</p>
        </div>

        <el-steps :active="activeStep" finish-status="success" simple class="steps">
          <el-step title="账户信息" />
          <el-step title="个人信息" />
          <el-step title="完成" />
        </el-steps>

        <!-- 步骤1：账户信息 -->
        <el-form
          v-if="activeStep === 0"
          ref="formRef1"
          :model="registerForm"
          :rules="rules1"
          class="register-form"
        >
          <el-form-item prop="Username">
            <el-input
              v-model="registerForm.Username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>

          <el-form-item prop="Password">
            <el-input
              v-model="registerForm.Password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @input="checkPasswordStrength"
            />
            <!-- 密码强度指示器 -->
            <div class="password-strength" v-if="registerForm.Password">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :style="{ width: passwordStrength.percent + '%', background: passwordStrength.color }"
                ></div>
              </div>
              <span class="strength-text" :style="{ color: passwordStrength.color }">
                {{ passwordStrength.text }}
              </span>
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="next-btn" @click="nextStep(1)">
              下一步 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 步骤2：个人信息 -->
        <el-form
          v-if="activeStep === 1"
          ref="formRef2"
          :model="registerForm"
          :rules="rules2"
          class="register-form"
        >
          <el-form-item prop="RealName">
            <el-input
              v-model="registerForm.RealName"
              placeholder="真实姓名"
              size="large"
              :prefix-icon="UserFilled"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item prop="Phone">
            <el-input
              v-model="registerForm.Phone"
              placeholder="手机号"
              size="large"
              :prefix-icon="Iphone"
              maxlength="11"
            >
              <template #append>
                <el-button @click="sendCode" :disabled="countdown > 0">
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="smsCode">
            <el-input
              v-model="registerForm.smsCode"
              placeholder="验证码"
              size="large"
              :prefix-icon="Message"
              maxlength="6"
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="activeStep = 0" size="large">上一步</el-button>
            <el-button type="primary" size="large" class="next-btn" @click="nextStep(2)">
              下一步 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 步骤3：完成 -->
        <div v-if="activeStep === 2" class="success-step">
          <el-result
            icon="success"
            title="注册成功"
            sub-title="您的账户已创建成功，即将跳转到登录页面"
          >
            <template #extra>
              <el-button type="primary" @click="goToLogin">立即登录</el-button>
            </template>
          </el-result>
        </div>

        <div class="form-footer" v-if="activeStep < 2">
          <span>已有账户？</span>
          <el-button link type="primary" @click="goToLogin">
            立即登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Lock, 
  CirclePlusFilled, 
  ArrowRight, 
  UserFilled, 
  Iphone, 
  Message 
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { authApi } from '../../api/auth'
import type { RegisterDto } from '../../types/api'

const router = useRouter()

const activeStep = ref(0)
const loading = ref(false)
const countdown = ref(0)
const formRef1 = ref<FormInstance>()
const formRef2 = ref<FormInstance>()

// 表单数据
const registerForm = reactive<RegisterDto & { confirmPassword: string; smsCode: string }>({
  Username: '',
  Password: '',
  confirmPassword: '',
  RealName: '',
  Phone: '',
  smsCode: ''
})

// 密码强度
const passwordStrength = computed(() => {
  const pwd = registerForm.Password
  if (!pwd) return { percent: 0, text: '', color: '' }
  
  let score = 0
  if (pwd.length >= 8) score += 25
  if (pwd.length >= 12) score += 25
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25
  if (/[0-9]/.test(pwd)) score += 25
  
  if (score <= 25) return { percent: 33, text: '弱', color: '#F56C6C' }
  if (score <= 75) return { percent: 66, text: '中', color: '#E6A23C' }
  return { percent: 100, text: '强', color: '#67C23A' }
})

// 验证规则
const validateConfirmPassword = (_rule: any, value: string, callback: Function) => {
  if (value !== registerForm.Password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (_rule: any, value: string, callback: Function) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules1: FormRules = {
  Username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  Password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const rules2: FormRules = {
  RealName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  Phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

const checkPasswordStrength = () => {
  // 实时检查密码强度，已在 computed 中实现
}

const sendCode = () => {
  if (!registerForm.Phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  // 模拟发送验证码
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  ElMessage.success('验证码已发送（演示环境：123456）')
  registerForm.smsCode = '123456' // 演示环境自动填充
}

const nextStep = async (step: number) => {
  if (step === 1) {
    await formRef1.value?.validate()
    activeStep.value = 1
  } else if (step === 2) {
    await formRef2.value?.validate()
    await submitRegister()
  }
}

const submitRegister = async () => {
  loading.value = true
  try {
    const { confirmPassword, smsCode, ...registerData } = registerForm
    await authApi.register(registerData)
    ElMessage.success('注册成功')
    activeStep.value = 2
    
    // 3秒后自动跳转
    setTimeout(() => {
      goToLogin()
    }, 3000)
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
}

.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  animation: animate 25s linear infinite;
  bottom: -150px;
  border-radius: 50%;
}

.circles li:nth-child(1) { left: 25%; width: 80px; height: 80px; animation-delay: 0s; }
.circles li:nth-child(2) { left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
.circles li:nth-child(3) { left: 70%; width: 20px; height: 20px; animation-delay: 4s; }
.circles li:nth-child(4) { left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
.circles li:nth-child(5) { left: 65%; width: 20px; height: 20px; animation-delay: 0s; }
.circles li:nth-child(6) { left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
.circles li:nth-child(7) { left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
.circles li:nth-child(8) { left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
.circles li:nth-child(9) { left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
.circles li:nth-child(10) { left: 85%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s; }

@keyframes animate {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}

.register-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.register-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 15px 0 5px;
  font-size: 24px;
  color: #303133;
}

.form-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.steps {
  margin-bottom: 30px;
}

.register-form {
  margin-top: 20px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 4px 11px;
}

.register-form :deep(.el-input__inner) {
  height: 40px;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e4e7ed;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.next-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

.success-step {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .register-box {
    padding: 30px 20px;
    max-width: 100%;
  }
}
</style>