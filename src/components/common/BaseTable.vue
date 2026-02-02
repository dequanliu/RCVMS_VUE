<template>
  <div class="base-table">
    <!-- 表格顶部操作栏 -->
    <div class="table-header" v-if="$slots.header || showAddButton">
      <div class="left">
        <slot name="header-left" />
      </div>
      <div class="right">
        <el-button 
          v-if="showAddButton" 
          type="primary" 
          @click="$emit('add')"
          :icon="Plus"
        >
          {{ addButtonText }}
        </el-button>
        <slot name="header-right" />
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-loading="loading"
      :data="data"
      :stripe="stripe"
      :border="border"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @sort-change="handleSortChange"
      ref="tableRef"
    >
      <!-- 选择列 -->
      <el-table-column 
        v-if="showSelection" 
        type="selection" 
        width="55" 
        align="center"
        :reserve-selection="reserveSelection"
      />

      <!-- 序号列 -->
      <el-table-column 
        v-if="showIndex" 
        type="index" 
        width="60" 
        label="序号"
        align="center"
        :index="indexMethod"
      />

      <!-- 动态列 -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :align="column.align || 'left'"
          :header-align="column.headerAlign"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
        >
          <template #default="{ row, $index }">
            <!-- 自定义插槽 -->
            <slot 
              v-if="column.slot" 
              :name="column.prop" 
              :row="row" 
              :index="$index"
            >
              {{ row[column.prop] }}
            </slot>
            
            <!-- 动态组件渲染 -->
            <component
              v-else-if="column.component"
              :is="column.component"
              :row="row"
              :column="column"
              :index="$index"
              @click="handleComponentClick(row, column)"
            />
            
            <!-- 格式化显示 -->
            <span v-else-if="column.formatter">
              {{ column.formatter(row[column.prop], row) }}
            </span>
            
            <!-- 枚举值映射 -->
            <el-tag 
              v-else-if="column.enumMap" 
              :type="column.enumMap[row[column.prop]]?.type || 'info'"
              size="small"
            >
              {{ column.enumMap[row[column.prop]]?.label || row[column.prop] }}
            </el-tag>
            
            <!-- 默认文本 -->
            <span v-else :class="column.className">
              {{ row[column.prop] ?? '-' }}
            </span>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column 
        v-if="showAction" 
        label="操作" 
        :width="actionWidth"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <slot name="action" :row="row">
            <el-button 
              v-if="showView" 
              link 
              type="primary" 
              :icon="View"
              @click.stop="$emit('view', row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="showEdit" 
              link 
              type="primary" 
              :icon="Edit"
              @click.stop="$emit('edit', row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="showDelete" 
              link 
              type="danger" 
              :icon="Delete"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>

      <!-- 空数据 -->
      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="showPagination && total > 0">
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        v-bind="paginationProps"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import Pagination from './Pagination.vue'

export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  slot?: boolean
  component?: any
  formatter?: (value: any, row: any) => string
  enumMap?: Record<string, { label: string; type?: any }>
  className?: string
}

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  height?: string | number
  maxHeight?: string | number
  rowKey?: string | ((row: any) => string)
  treeProps?: { children: string; hasChildren: string }
  defaultExpandAll?: boolean
  highlightCurrentRow?: boolean
  
  // 功能开关
  showSelection?: boolean
  showIndex?: boolean
  reserveSelection?: boolean
  showAction?: boolean
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showAddButton?: boolean
  
  // 操作列配置
  actionWidth?: string | number
  
  // 分页配置
  showPagination?: boolean
  pagination?: { current: number; pageSize: number; total: number }
  paginationProps?: Record<string, any>
  addButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stripe: true,
  border: false,
  size: 'default',
  showSelection: false,
  showIndex: true,
  reserveSelection: false,
  showAction: true,
  showView: true,
  showEdit: true,
  showDelete: true,
  showAddButton: false,
  actionWidth: 180,
  showPagination: true,
  addButtonText: '新增',
  pagination: () => ({ current: 1, pageSize: 10, total: 0 }),
  paginationProps: () => ({})
})

const emit = defineEmits<{
  add: []
  view: [row: any]
  edit: [row: any]
  delete: [row: any]
  'selection-change': [selection: any[]]
  'row-click': [row: any]
  'sort-change': [params: { column: any; prop: string; order: any }]
  'page-change': [page: number, pageSize: number]
}>()

const tableRef = ref<any>(null)

// 分页相关
const currentPage = computed({
  get: () => props.pagination.current,
  set: (val) => emit('page-change', val, pageSize.value)
})

const pageSize = computed({
  get: () => props.pagination.pageSize,
  set: (val) => emit('page-change', currentPage.value, val)
})

const total = computed(() => props.pagination.total)

// 方法
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleRowClick = (row: any) => {
  emit('row-click', row)
}

const handleSortChange = (params: any) => {
  emit('sort-change', params)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', row)
  }).catch(() => {})
}

const handlePageChange = (page: number, pageSize: number) => {
  emit('page-change', page, pageSize)
}

const handleComponentClick = (row: any, column: TableColumn) => {
  if (column.onClick) {
    column.onClick(row)
  }
}

const indexMethod = (index: number) => {
  if (!props.showPagination) return index + 1
  return (props.pagination.current - 1) * props.pagination.pageSize + index + 1
}

// 暴露方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => {
    tableRef.value?.toggleRowSelection(row, selected)
  },
  toggleAllSelection: () => tableRef.value?.toggleAllSelection()
})
</script>

<style scoped>
.base-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left, .right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #606266;
}
</style>