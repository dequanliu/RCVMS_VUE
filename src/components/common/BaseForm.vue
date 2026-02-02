<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :size="size"
    :inline="inline"
    :disabled="disabled"
    :hide-required-asterisk="hideRequiredAsterisk"
    :show-message="showMessage"
    :status-icon="statusIcon"
    @validate="handleValidate"
  >
    <el-row :gutter="gutter">
      <template v-for="(field, index) in fields" :key="field.prop">
        <el-col 
          :span="field.span || 24" 
          :xs="24"
          v-show="!field.hidden"
        >
          <el-form-item
            :prop="field.prop"
            :label="field.label"
            :rules="field.rules"
            :label-width="field.labelWidth"
            :class="field.className"
          >
            <!-- 自定义插槽 -->
            <slot 
              v-if="field.slot" 
              :name="field.prop" 
              :field="field"
              :model="model"
              :value="model[field.prop]"
            >
              <el-input 
                v-model="model[field.prop]" 
                :placeholder="field.placeholder || `请输入${field.label}`"
                v-bind="field.props"
              />
            </slot>

            <!-- 输入框 -->
            <el-input
              v-else-if="field.type === 'input' || !field.type"
              v-model="model[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :readonly="field.readonly"
              :show-password="field.showPassword"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              :prefix-icon="field.prefixIcon"
              :suffix-icon="field.suffixIcon"
              v-bind="field.props"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="model[field.prop]"
              :placeholder="field.placeholder"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :precision="field.precision"
              :controls="field.controls !== false"
              :disabled="field.disabled"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 文本域 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="model[field.prop]"
              type="textarea"
              :rows="field.rows || 3"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              v-bind="field.props"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 选择框 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="model[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :filterable="field.filterable"
              :multiple="field.multiple"
              :collapse-tags="field.collapseTags"
              :disabled="field.disabled"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.disabled"
              />
            </el-select>

            <!-- 级联选择 -->
            <el-cascader
              v-else-if="field.type === 'cascader'"
              v-model="model[field.prop]"
              :options="field.options"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :filterable="field.filterable"
              :props="field.cascaderProps"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 单选框 -->
            <el-radio-group
              v-else-if="field.type === 'radio'"
              v-model="model[field.prop]"
              :disabled="field.disabled"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            >
              <el-radio
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>

            <!-- 复选框 -->
            <el-checkbox-group
              v-else-if="field.type === 'checkbox'"
              v-model="model[field.prop]"
              :disabled="field.disabled"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            >
              <el-checkbox
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 开关 -->
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="model[field.prop]"
              :active-text="field.activeText"
              :inactive-text="field.inactiveText"
              :active-value="field.activeValue !== undefined ? field.activeValue : true"
              :inactive-value="field.inactiveValue !== undefined ? field.inactiveValue : false"
              :disabled="field.disabled"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 日期选择 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="model[field.prop]"
              :type="field.dateType || 'date'"
              :placeholder="field.placeholder || `选择${field.label}`"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :format="field.format"
              :value-format="field.valueFormat"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 时间选择 -->
            <el-time-picker
              v-else-if="field.type === 'time'"
              v-model="model[field.prop]"
              :placeholder="field.placeholder || `选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 日期时间 -->
            <el-date-picker
              v-else-if="field.type === 'datetime'"
              v-model="model[field.prop]"
              type="datetime"
              :placeholder="field.placeholder || `选择${field.label}`"
              :format="field.format || 'YYYY-MM-DD HH:mm:ss'"
              :value-format="field.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
              :clearable="field.clearable !== false"
              style="width: 100%"
              @change="(val: any) => handleFieldChange(field.prop, val)"
            />

            <!-- 上传 -->
            <el-upload
              v-else-if="field.type === 'upload'"
              v-model:file-list="model[field.prop]"
              :action="field.action"
              :headers="field.headers"
              :multiple="field.multiple"
              :limit="field.limit"
              :accept="field.accept"
              :before-upload="field.beforeUpload"
              :on-success="(res: any) => handleUploadSuccess(field.prop, res)"
              :on-error="field.onError"
              v-bind="field.props"
            >
              <el-button type="primary">点击上传</el-button>
              <template #tip v-if="field.tip">
                <div class="el-upload__tip">{{ field.tip }}</div>
              </template>
            </el-upload>

            <!-- 富文本编辑器占位（需要额外安装） -->
            <div v-else-if="field.type === 'editor'" class="editor-placeholder">
              <el-input
                v-model="model[field.prop]"
                type="textarea"
                :rows="5"
                :placeholder="field.placeholder"
              />
            </div>
          </el-form-item>
        </el-col>
      </template>
    </el-row>

    <!-- 按钮区域 -->
    <el-form-item v-if="showFooter" class="form-footer">
      <slot name="footer">
        <el-button @click="handleCancel" v-if="showCancel">
          {{ cancelText }}
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="submitLoading"
          v-if="showSubmit"
        >
          {{ submitText }}
        </el-button>
      </slot>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface FormField {
  prop: string
  label: string
  type?: 'input' | 'number' | 'textarea' | 'select' | 'cascader' | 'radio' | 'checkbox' | 'switch' | 'date' | 'time' | 'datetime' | 'upload' | 'editor'
  value?: any
  span?: number
  hidden?: boolean
  slot?: boolean
  
  // 输入框相关
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
  showPassword?: boolean
  maxlength?: number
  showWordLimit?: boolean
  prefixIcon?: any
  suffixIcon?: any
  
  // 数字输入相关
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  
  // 选择器相关
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  filterable?: boolean
  multiple?: boolean
  collapseTags?: boolean
  cascaderProps?: any
  
  // 开关相关
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
  
  // 日期时间相关
  dateType?: 'date' | 'daterange' | 'datetime' | 'datetimerange'
  format?: string
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  
  // 上传相关
  action?: string
  headers?: Record<string, string>
  limit?: number
  accept?: string
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  onError?: (error: any) => void
  tip?: string
  
  // 验证相关
  rules?: any[]
  labelWidth?: string | number
  className?: string
  
  // 其他属性
  rows?: number
  props?: Record<string, any>
  onChange?: (value: any) => void
}

interface Props {
  model: Record<string, any>
  fields: FormField[]
  rules?: FormRules
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  inline?: boolean
  disabled?: boolean
  hideRequiredAsterisk?: boolean
  showMessage?: boolean
  statusIcon?: boolean
  gutter?: number
  showFooter?: boolean
  showSubmit?: boolean
  showCancel?: boolean
  submitText?: string
  cancelText?: string
  submitLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  labelPosition: 'right',
  size: 'default',
  inline: false,
  disabled: false,
  hideRequiredAsterisk: false,
  showMessage: true,
  statusIcon: false,
  gutter: 20,
  showFooter: true,
  showSubmit: true,
  showCancel: true,
  submitText: '提交',
  cancelText: '取消',
  submitLoading: false
})

const emit = defineEmits<{
  submit: []
  cancel: []
  'field-change': [prop: string, value: any]
  validate: [prop: string, isValid: boolean, message: string]
}>()

const formRef = ref<FormInstance>()

// 监听字段变化，设置默认值
watch(() => props.fields, (fields) => {
  fields.forEach(field => {
    if (field.value !== undefined && props.model[field.prop] === undefined) {
      props.model[field.prop] = field.value
    }
  })
}, { immediate: true, deep: true })

const handleFieldChange = (prop: string, value: any) => {
  props.fields.find(f => f.prop === prop)?.onChange?.(value)
  emit('field-change', prop, value)
}

const handleUploadSuccess = (prop: string, response: any) => {
  // 处理上传成功后的文件URL
  if (response.url) {
    if (Array.isArray(props.model[prop])) {
      const fileList = props.model[prop]
      const file = fileList[fileList.length - 1]
      if (file) file.url = response.url
    }
  }
}

const handleValidate = (prop: string, isValid: boolean, message: string) => {
  emit('validate', prop, isValid, message)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 方法暴露
const validate = () => formRef.value?.validate()
const validateField = (props: string | string[]) => formRef.value?.validateField(props)
const resetFields = () => formRef.value?.resetFields()
const clearValidate = (props?: string | string[]) => formRef.value?.clearValidate(props)
const scrollToField = (prop: string) => formRef.value?.scrollToField(prop)

defineExpose({
  formRef,
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField
})
</script>

<style scoped>
.form-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.editor-placeholder {
  width: 100%;
}
</style>