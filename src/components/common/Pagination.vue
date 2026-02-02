<template>
  <div class="base-pagination">
    <div class="pagination-left" v-if="showTotal">
      共 <strong>{{ total }}</strong> 条记录
      <span v-if="totalPages > 0">，第 {{ currentPage }}/{{ totalPages }} 页</span>
    </div>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      :pager-count="pagerCount"
      :prev-text="prevText"
      :next-text="nextText"
      :disabled="disabled"
      :hide-on-single-page="hideOnSinglePage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  pagerCount?: number
  prevText?: string
  nextText?: string
  disabled?: boolean
  hideOnSinglePage?: boolean
  showTotal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  pagerCount: 7,
  disabled: false,
  hideOnSinglePage: false,
  showTotal: true
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'size-change': [size: number]
  'current-change': [page: number]
  change: [page: number, pageSize: number]
}>()

const currentPage = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})

const pageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const handleSizeChange = (val: number) => {
  emit('size-change', val)
  emit('change', currentPage.value, val)
}

const handleCurrentChange = (val: number) => {
  emit('current-change', val)
  emit('change', val, pageSize.value)
}
</script>

<style scoped>
.base-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.pagination-left {
  color: #606266;
  font-size: 14px;
  
  strong {
    color: #409eff;
    margin: 0 4px;
  }
}

:deep(.el-pagination) {
  justify-content: flex-end;
}
</style>