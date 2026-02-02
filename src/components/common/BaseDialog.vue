<template>
  <el-dialog
    ref="dialogRef"
    v-model="visible"
    :title="title"
    :width="width"
    :top="top"
    :modal="modal"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :center="center"
    :align-center="alignCenter"
    :fullscreen="fullscreen"
    :custom-class="customClass"
    :destroy-on-close="destroyOnClose"
    :draggable="draggable"
    :overflow="overflow"
  >
    <template #header>
      <slot name="header">
        <div class="dialog-header">
          <span>{{ title }}</span>
          <div class="header-actions" v-if="showFullscreen">
            <el-icon @click="toggleFullscreen" class="action-icon">
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </div>
        </div>
      </slot>
    </template>

    <div class="dialog-body" v-loading="loading">
      <slot />
    </div>

    <template #footer>
      <slot name="footer" v-if="showFooter">
        <div class="dialog-footer">
          <el-button @click="handleCancel" :disabled="confirmLoading" v-if="showCancel">
            {{ cancelText }}
          </el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm" 
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            v-if="showConfirm"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FullScreen, Aim } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  top?: string
  modal?: boolean
  appendTo-body?: boolean
  lock-scroll?: boolean
  close-on-click-modal?: boolean
  close-on-press-escape?: boolean
  show-close?: boolean
  center?: boolean
  align-center?: boolean
  custom-class?: string
  destroy-on-close?: boolean
  draggable?: boolean
  overflow?: boolean
  loading?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  showFullscreen?: boolean
  cancelText?: string
  confirmText?: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
  beforeClose?: (done: () => void) => void
  confirmBeforeClose?: boolean
  confirmMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  width: '50%',
  top: '15vh',
  modal: true,
  appendToBody: false,
  lockScroll: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  center: false,
  alignCenter: false,
  customClass: '',
  destroyOnClose: false,
  draggable: false,
  overflow: false,
  loading: false,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  showFullscreen: false,
  cancelText: '取消',
  confirmText: '确定',
  confirmLoading: false,
  confirmDisabled: false,
  confirmBeforeClose: false,
  confirmMessage: '确定要关闭吗？未保存的更改将丢失。'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
  cancel: []
  confirm: []
  'before-close': []
}>()

const dialogRef = ref<any>(null)
const isFullscreen = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fullscreen = computed(() => props.overflow ? false : isFullscreen.value)

// 监听打开状态
watch(() => props.modelValue, (val) => {
  if (val) {
    emit('open')
    setTimeout(() => emit('opened'), 0)
  } else {
    emit('close')
    setTimeout(() => emit('closed'), 0)
  }
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else if (props.confirmBeforeClose) {
    ElMessageBox.confirm(props.confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    }).catch(() => {})
  } else {
    done()
  }
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm')
}

// 方法暴露
const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const toggleFull = () => {
  toggleFullscreen()
}

defineExpose({
  dialogRef,
  open,
  close,
  toggleFull,
  isFullscreen
})
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-icon {
  cursor: pointer;
  font-size: 16px;
  color: #909399;
  transition: color 0.3s;
}

.action-icon:hover {
  color: #409eff;
}

.dialog-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog.is-fullscreen) {
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog.is-fullscreen .el-dialog__body) {
  flex: 1;
  max-height: none;
  overflow: auto;
}
</style>