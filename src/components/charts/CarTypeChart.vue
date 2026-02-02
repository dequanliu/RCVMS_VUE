<template>
  <div class="car-type-chart" ref="chartRef" :style="{ height: height + 'px' }">
    <div v-if="loading" class="loading-mask">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface CarTypeData {
  carType: string
  count: number
  percentage?: number
  color?: string
}

interface Props {
  data: CarTypeData[]
  loading?: boolean
  height?: number
  chartType?: 'pie' | 'doughnut' | 'rose' | 'bar'
  title?: string
  subtitle?: string
  theme?: 'light' | 'dark'
  showLegend?: boolean
  showLabel?: boolean
  showCenterText?: boolean
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 350,
  chartType: 'doughnut',
  title: '车辆类型分布',
  subtitle: '',
  theme: 'light',
  showLegend: true,
  showLabel: true,
  showCenterText: true,
  colors: () => ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#8B5CF6']
})

const emit = defineEmits<{
  click: [data: CarTypeData]
  hover: [data: CarTypeData]
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 类型映射
const typeMap: Record<string, string> = {
  'Owner': '业主车辆',
  'Temporary': '临时车辆',
  'Visitor': '访客车辆',
  'Delivery': '配送车辆',
  'Emergency': '应急车辆',
  'Other': '其他车辆'
}

// 计算总数
const totalCount = computed(() => {
  return props.data.reduce((sum, item) => sum + item.count, 0)
})

// 处理数据
const processData = () => {
  return props.data.map((item, index) => ({
    name: typeMap[item.carType] || item.carType,
    value: item.count,
    percentage: item.percentage || ((item.count / totalCount.value) * 100).toFixed(1),
    original: item,
    itemStyle: {
      color: item.color || props.colors[index % props.colors.length]
    }
  }))
}

const getOption = (): EChartsOption => {
  const data = processData()
  const isDark = props.theme === 'dark'
  const textColor = isDark ? '#ccc' : '#333'
  
  const isBar = props.chartType === 'bar'
  
  if (isBar) {
    // 柱状图配置
    return {
      backgroundColor: 'transparent',
      title: {
        text: props.title,
        subtext: props.subtitle,
        left: 'center',
        textStyle: { color: textColor, fontSize: 16 },
        subtextStyle: { color: isDark ? '#999' : '#666' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0]
          const item = data[param.dataIndex]
          return `${param.name}<br/>数量: ${param.value} 辆<br/>占比: ${item.percentage}%`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLabel: { color: textColor, rotate: 30 },
        axisLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: '{value} 辆',
          color: textColor
        },
        splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
          itemStyle: item.itemStyle
        })),
        barWidth: '50%',
        label: {
          show: props.showLabel,
          position: 'top',
          formatter: '{c} 辆'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
  }

  // 饼图配置（饼图、环形图、玫瑰图）
  const isRose = props.chartType === 'rose'
  const radius = props.chartType === 'pie' ? '65%' : ['45%', '70%']
  const centerText = props.showCenterText && props.chartType !== 'pie' ? {
    title: {
      text: '总车辆',
      subtext: `${totalCount.value} 辆`,
      left: 'center',
      top: '45%',
      textStyle: {
        color: isDark ? '#999' : '#666',
        fontSize: 14
      },
      subtextStyle: {
        color: textColor,
        fontSize: 20,
        fontWeight: 'bold'
      }
    }
  } : {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center',
      textStyle: { color: textColor, fontSize: 16 },
      subtextStyle: { color: isDark ? '#999' : '#666' }
    }
  }

  return {
    backgroundColor: 'transparent',
    ...centerText,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>数量: ${params.value} 辆<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      show: props.showLegend,
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: textColor },
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        return `${name}  ${item?.value}辆 (${item?.percentage}%)`
      }
    },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: radius,
        center: ['40%', '55%'],
        roseType: isRose ? 'radius' : false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#1f1f1f' : '#fff',
          borderWidth: 2
        },
        label: {
          show: props.showLabel,
          formatter: '{b}\n{c}辆 ({d}%)',
          color: textColor
        },
        labelLine: {
          length: 15,
          length2: 10,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: data
      }
    ]
  }
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(getOption())
  
  chartInstance.on('click', (params: any) => {
    const dataItem = props.data.find(item => 
      (typeMap[item.carType] || item.carType) === params.name
    )
    if (dataItem) {
      emit('click', dataItem)
    }
  })
  
  chartInstance.on('mouseover', (params: any) => {
    const dataItem = props.data.find(item => 
      (typeMap[item.carType] || item.carType) === params.name
    )
    if (dataItem) {
      emit('hover', dataItem)
    }
  })
  
  const resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
  ;(chartInstance as any)._resizeObserver = resizeObserver
}

const disposeChart = () => {
  if (chartInstance) {
    const resizeObserver = (chartInstance as any)._resizeObserver
    if (resizeObserver) resizeObserver.disconnect()
    chartInstance.dispose()
    chartInstance = null
  }
}

const updateChart = () => {
  if (chartInstance && !props.loading) {
    chartInstance.setOption(getOption(), true)
  }
}

const downloadImage = (filename?: string) => {
  if (!chartInstance) return
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: props.theme === 'dark' ? '#1f1f1f' : '#fff'
  })
  const link = document.createElement('a')
  link.download = filename || `车辆分布_${new Date().toLocaleDateString()}.png`
  link.href = url
  link.click()
}

// 切换图表类型
const changeChartType = (type: 'pie' | 'doughnut' | 'rose' | 'bar') => {
  // 这个可以通过父组件改变 props.chartType 来实现
}

onMounted(() => {
  if (!props.loading) initChart()
})

onUnmounted(() => {
  disposeChart()
})

watch(() => props.loading, (val) => {
  if (!val) {
    setTimeout(() => {
      if (!chartInstance) initChart()
      else updateChart()
    }, 0)
  }
})

watch(() => [props.data, props.theme, props.chartType], () => {
  updateChart()
}, { deep: true })

defineExpose({
  chartInstance,
  downloadImage,
  resize: () => chartInstance?.resize(),
  changeChartType
})
</script>

<style scoped>
.car-type-chart {
  width: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}
</style>