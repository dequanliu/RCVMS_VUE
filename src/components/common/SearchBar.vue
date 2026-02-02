<template>
  <div class="search-bar" :class="{ 'is-collapse': isCollapse && collapse }">
    <el-form
      :model="model"
      inline
      :size="size"
      class="search-form"
      @keyup.enter="handleSearch"
    >
      <el-row :gutter="gutter">
        <el-col 
          v-for="(item, index) in visibleItems" 
          :key="item.prop"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6" 
          :xl="4"
        >
          <el-form-item :label="item.label" :prop="item.prop">
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'input' || !item.type"
              v-model="model[item.prop]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :clearable="item.clearable !== false"
              v-bind="item.props"
              style="width: 100%"
            />

            <!-- 选择框 -->
            <el-select
              v-else-if="item.type === 'select'"
              v-model="model[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :filterable="item.filterable"
              :multiple="item.multiple"
              style="width: 100%"
              v-bind="item.props"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- 日期选择 -->
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="model[item.prop]"
              :type="item.dateType || 'date'"
              :placeholder="item.placeholder || `选择${item.label}`"
              :start-placeholder="item.startPlaceholder || '开始日期'"
              :end-placeholder="item.endPlaceholder || '结束日期'"
              :value-format="item.valueFormat"
              style="width: 100%"
              v-bind="item.props"
            />

            <!-- 级联选择 -->
            <el-cascader
              v-else-if="item.type === 'cascader'"
              v-model="model[item.prop]"
              :options="item.options"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              style="width: 100%"
              v-bind="item.props"
            />

            <!-- 数字范围（自定义组件） -->
            <div v-else-if="item.type === 'number-range'" class="number-range">
              <el-input-number
                v-model="model[item.prop + 'Min']"
                :placeholder="item.startPlaceholder || '最小值'"
                :controls="false"
                style="width: calc(50% - 15px)"
              />
              <span class="separator">-</span>
              <el-input-number
                v-model="model[item.prop + 'Max']"
                :placeholder="item.endPlaceholder || '最大值'"
                :controls="false"
                style="width: calc(50% - 15px)"
              />
            </div>

            <!-- 自定义插槽 -->
            <slot 
              v-else-if="item.slot" 
              :name="item.prop" 
              :item="item"
              :value="model[item.prop]"
            />
          </el-form-item>
        </el-col>

        <!-- 按钮区域 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item class="search-buttons">
            <el-button type="primary" @click="handleSearch" :icon="Search">
              {{ searchText }}
            </el-button>
            <el-button @click="handleReset" :icon="RefreshRight">
              {{ resetText }}
            </el-button>
            <el-button
              v-if="collapse && items.length > showCount"
              link
              type="primary"
              @click="isCollapse = !isCollapse"
            >
              {{ isCollapse ? '展开' : '收起' }}
              <el-icon class="el-icon--right">
                <ArrowUp v-if="!isCollapse" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, RefreshRight, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

export interface SearchItem {
  prop: string
  label: string
  type?: 'input' | 'select' | 'date' | 'cascader' | 'number-range'
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  options?: Array<{ label: string; value: any }>
  dateType?: 'date' | 'daterange' | 'month' | 'year'
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  slot?: boolean
  hidden?: boolean
  props?: Record<string, any>
}

interface Props {
  model: Record<string, any>
  items: SearchItem[]
  size?: 'large' | 'default' | 'small'
  gutter?: number
  collapse?: boolean
  showCount?: number
  searchText?: string
  resetText?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  gutter: 10,
  collapse: true,
  showCount: 3,
  searchText: '查询',
  resetText: '重置',
  debounce: 300
})

const emit = defineEmits<{
  search: [model: Record<string, any>]
  reset: []
  'update:model': [model: Record<string, any>]
}>()

const isCollapse = ref(true)
let searchTimer: number | null = null

// 显示的搜索项（处理折叠）
const visibleItems = computed(() => {
  if (!props.collapse || !isCollapse.value) return props.items.filter(item => !item.hidden)
  return props.items.filter((item, index) => !item.hidden && index < props.showCount)
})

// 处理搜索（防抖）
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = window.setTimeout(() => {
    emit('search', { ...props.model })
  }, props.debounce)
}

// 重置
const handleReset = () => {
  // 清空所有值
  Object.keys(props.model).forEach(key => {
    const item = props.items.find(i => i.prop === key)
    if (item?.type === 'number-range') {
      props.model[key + 'Min'] = undefined
      props.model[key + 'Max'] = undefined
    } else {
      props.model[key] = undefined
    }
  })
  
  emit('reset')
  emit('search', {})
}

// 展开/收起
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

defineExpose({
  search: handleSearch,
  reset: handleReset,
  toggleCollapse
})
</script>

<style scoped>
.search-bar {
  background: #fff;
  padding: 18px 18px 0;
  margin-bottom: 20px;
  border-radius: 4px;
}

.search-form {
  .el-form-item {
    margin-bottom: 18px;
    width: 100%;
    
    :deep(.el-form-item__content) {
      width: calc(100% - 80px);
    }
  }
}

.search-buttons {
  .el-button {
    margin-bottom: 18px;
  }
}

.number-range {
  display: flex;
  align-items: center;
  
  .separator {
    margin: 0 8px;
    color: #909399;
  }
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper) {
  width: 100%;
}
</style>