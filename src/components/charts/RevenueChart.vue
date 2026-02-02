<template>
  <div class="revenue-chart" ref="chartRef" :style="{ height: height + 'px' }">
    <el-skeleton :rows="5" animated v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface DailyRevenue {
  date: string
  revenue: number
  target?: number
}

interface Props {
  data: DailyRevenue[]
  loading?: boolean
  height?: number
  chartType?: 'line' | 'bar' | 'mixed'
  showTarget?: boolean
  title?: string
  theme?: 'light' | 'dark'
  currency?: string
  dateFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 350,
  chartType: 'mixed',
  showTarget: false,
  title: '收入趋势',
  theme: 'light',
  currency: '¥',
  dateFormat: 'MM-DD'
})

const emit = defineEmits<{
  click: [params: any]
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 获取图表配置
const getOption = (): EChartsOption => {
  const dates = props.data.map(item => formatDate(item.date))
  const revenues = props.data.map(item => item.revenue)
  const targets = props.data.map(item => item.target || 0)
  
  const isDark = props.theme === 'dark'
  const textColor = isDark ? '#ccc' : '#333'
  const gridColor = isDark ? '#333' : '#eee'
  
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    title: {
      text: props.title,
      left: 'center',
      top: 10,
      textStyle: {
        color: textColor,
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: (params: any) => {
        let html = `<div style="font-weight:bold;margin-bottom:5px">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value
          html += `<div style="display:flex;align-items:center">
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color}"></span>
            <span>${param.seriesName}: ${props.currency}${value}</span>
          </div>`
        })
        return html
      }
    },
    legend: {
      data: props.showTarget ? ['实际收入', '目标收入'] : ['实际收入'],
      bottom: 0,
      textStyle: {
        color: textColor
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {
          lineStyle: {
            color: gridColor
          }
        },
        axisLabel: {
          color: textColor,
          rotate: dates.length > 10 ? 45 : 0
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额',
        axisLabel: {
          formatter: `{value} ${props.currency}`,
          color: textColor
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: gridColor
          }
        },
        splitLine: {
          lineStyle: {
            color: gridColor,
            type: 'dashed'
          }
        }
      }
    ],
    series: [
      {
        name: '实际收入',
        type: props.chartType === 'bar' ? 'bar' : 'line',
        data: revenues,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF',
          borderRadius: props.chartType === 'bar' ? [4, 4, 0, 0] : 0
        },
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(64, 158, 255, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        areaStyle: props.chartType === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        } : undefined,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  }

  if (props.showTarget) {
    option.series?.push({
      name: '目标收入',
      type: 'line',
      data: targets,
      smooth: true,
      symbol: 'diamond',
      symbolSize: 8,
      lineStyle: {
        width: 2,
        type: 'dashed',
        color: '#67C23A'
      },
      itemStyle: {
        color: '#67C23A'
      }
    })
  }

  return option
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(getOption())
  
  // 点击事件
  chartInstance.on('click', (params) => {
    emit('click', params)
  })
  
  // 窗口大小变化时自适应
  const resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
  
  // 保存引用以便销毁
  ;(chartInstance as any)._resizeObserver = resizeObserver
}

// 销毁图表
const disposeChart = () => {
  if (chartInstance) {
    const resizeObserver = (chartInstance as any)._resizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    chartInstance.dispose()
    chartInstance = null
  }
}

// 更新图表
const updateChart = () => {
  if (chartInstance && !props.loading) {
    chartInstance.setOption(getOption(), true)
  }
}

// 导出图片
const downloadImage = (filename?: string) => {
  if (!chartInstance) return
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  const link = document.createElement('a')
  link.download = filename || `收入统计_${new Date().toLocaleDateString()}.png`
  link.href = url
  link.click()
}

onMounted(() => {
  if (!props.loading) {
    initChart()
  }
})

onUnmounted(() => {
  disposeChart()
})

watch(() => props.loading, (val) => {
  if (!val) {
    setTimeout(() => {
      if (!chartInstance) {
        initChart()
      } else {
        updateChart()
      }
    }, 0)
  }
})

watch(() => [props.data, props.theme, props.chartType], () => {
  updateChart()
}, { deep: true })

defineExpose({
  chartInstance,
  downloadImage,
  resize: () => chartInstance?.resize()
})
</script>

<style scoped>
.revenue-chart {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}
</style>