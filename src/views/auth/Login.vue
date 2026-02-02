<template>
  <div class="login-page">
    <!-- 背景动画 -->
    <div class="bg-animation">
      <div class="bg-gradient"></div>
      <ul class="circles">
        <li v-for="i in 10" :key="i"></li>
      </ul>
    </div>

    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="logo">
            <el-icon size="64" color="#fff"><Van /></el-icon>
          </div>
          <h1 class="brand-title">RCVMS</h1>
          <p class="brand-subtitle">小区车辆管理系统</p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon><Checked /></el-icon>
              <span>智能化管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Checked /></el-icon>
              <span>实时监控</span>
            </div>
            <div class="feature-item">
              <el-icon><Checked /></el-icon>
              <span>数据分析</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-box">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账户</p>
          </div>

          <el-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="Username">
              <el-input
                v-model="loginForm.Username"
                placeholder="用户名"
                size="large"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="Password">
              <el-input
                v-model="loginForm.Password"
                type="password"
                placeholder="密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-button link type="primary" @click="handleForgotPassword">
                忘记密码？
              </el-button>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <span>还没有账户？</span>
            <el-button link type="primary" @click="goToRegister">
              立即注册
            </el-button>
          </div>

          <!-- 其他登录方式 -->
          <div class="other-login">
            <el-divider>其他登录方式</el-divider>
            <div class="social-buttons">
              <el-button circle size="large" @click="handleWechatLogin">
                <el-icon size="20"><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle size="large" @click="handleSmsLogin">
                <el-icon size="20"><Iphone /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 技术栈标识 -->
        <div class="tech-stack">
          <span>Powered by Vue 3 + Element Plus</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Van, Checked, ChatDotRound, Iphone } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '../../store/modules/auth'
import type { LoginDto } from '../../types/api'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive<LoginDto>({
  Username: '',
  Password: ''
})

const rules: FormRules = {
  Username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  Password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 从 localStorage 恢复记住的用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('remember_username')
  if (savedUsername) {
    loginForm.Username = savedUsername
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await authStore.login(loginForm)
    
    if (success) {
      // 处理记住我
      if (rememberMe.value) {
        localStorage.setItem('remember_username', loginForm.Username)
      } else {
        localStorage.removeItem('remember_username')
      }
      
      // 获取重定向地址
      const redirect = router.currentRoute.value.query.redirect as string
      router.replace(redirect || '/')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}

const goToRegister = () => {
  router.push('/register')
}

const handleWechatLogin = () => {
  ElMessage.info('微信登录功能开发中')
}

const handleSmsLogin = () => {
  ElMessage.info('短信登录功能开发中')
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景动画 */
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

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 左侧品牌区域 */
.login-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}

.brand-content {
  text-align: center;
}

.logo {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.brand-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.brand-subtitle {
  font-size: 24px;
  margin-top: 10px;
  opacity: 0.9;
  font-weight: 300;
}

.brand-features {
  margin-top: 60px;
  text-align: left;
  display: inline-block;
}

.feature-item {
  display: flex;
  align-items: center;
  margin: 20px 0;
  font-size: 18px;
  opacity: 0.9;
}

.feature-item .el-icon {
  margin-right: 12px;
  font-size: 20px;
}

/* 右侧表单区域 */
.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
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
  margin: 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.form-header p {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 4px 11px;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.login-form :deep(.el-input__inner) {
  height: 40px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

.other-login {
  margin-top: 30px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.social-buttons .el-button {
  border: 1px solid #dcdfe6;
  color: #606266;
  transition: all 0.3s;
}

.social-buttons .el-button:hover {
  color: #409eff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.tech-stack {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    padding: 0;
  }
  
  .login-brand {
    display: none;
  }
  
  .login-form-wrapper {
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .login-box {
    padding: 30px 20px;
    max-width: 100%;
  }
  
  .tech-stack {
    position: static;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.8);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-box {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .form-header h2 {
    color: #e0e0e0;
  }
  
  .form-header p {
    color: #a0a0a0;
  }
}
</style>