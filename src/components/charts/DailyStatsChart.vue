<template>
  <div class="daily-stats-chart" ref="chartRef" :style="{ height: height + 'px' }">
    <el-skeleton :rows="5" animated v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface DailyStats {
  date: string
  enterCount: number
  exitCount: number
  parkingCount?: number
}

interface Props {
  data: DailyStats[]
  loading?: boolean
  height?: number
  showParking?: boolean
  title?: string
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 350,
  showParking: true,
  title: '每日进出统计',
  theme: 'light'
})

const emit = defineEmits<{
  click: [params: any]
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const getOption = (): EChartsOption => {
  const dates = props.data.map(item => formatDate(item.date))
  const enterData = props.data.map(item => item.enterCount)
  const exitData = props.data.map(item => item.exitCount)
  const parkingData = props.data.map(item => item.parkingCount || 0)
  
  const isDark = props.theme === 'dark'
  const textColor = isDark ? '#ccc' : '#333'
  const gridColor = isDark ? '#333' : '#eee'

  const series: any[] = [
    {
      name: '入场车次',
      type: 'bar',
      data: enterData,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67C23A' },
          { offset: 1, color: '#95D475' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '30%'
    },
    {
      name: '出场车次',
      type: 'bar',
      data: exitData,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#F56C6C' },
          { offset: 1, color: '#F89898' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '30%'
    }
  ]

  if (props.showParking) {
    series.push({
      name: '在场车辆',
      type: 'line',
      yAxisIndex: 1,
      data: parkingData,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#409EFF'
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      }
    })
  }

  return {
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
        type: 'shadow'
      },
      formatter: (params: any) => {
        let html = `<div style="font-weight:bold;margin-bottom:5px">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          html += `<div style="display:flex;align-items:center;margin:3px 0">
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color}"></span>
            <span>${param.seriesName}: ${param.value} 辆</span>
          </div>`
        })
        // 计算净增长
        const enter = params.find((p: any) => p.seriesName === '入场车次')?.value || 0
        const exit = params.find((p: any) => p.seriesName === '出场车次')?.value || 0
        const net = enter - exit
        html += `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #eee;color:${net >= 0 ? '#67C23A' : '#F56C6C'}">
          净增长: ${net > 0 ? '+' : ''}${net} 辆
        </div>`
        return html
      }
    },
    legend: {
      data: props.showParking 
        ? ['入场车次', '出场车次', '在场车辆']
        : ['入场车次', '出场车次'],
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
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: gridColor
        }
      },
      axisLabel: {
        color: textColor,
        rotate: dates.length > 10 ? 45 : 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '车次',
        position: 'left',
        axisLabel: {
          formatter: '{value} 辆',
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
      },
      {
        type: 'value',
        name: '在场数',
        position: 'right',
        show: props.showParking,
        axisLabel: {
          formatter: '{value} 辆',
          color: textColor
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: gridColor
          }
        },
        splitLine: {
          show: false
        }
      }
    ],
    series
  }
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(getOption())
  
  chartInstance.on('click', (params) => {
    emit('click', params)
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
    backgroundColor: '#fff'
  })
  const link = document.createElement('a')
  link.download = filename || `每日统计_${new Date().toLocaleDateString()}.png`
  link.href = url
  link.click()
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

watch(() => [props.data, props.theme], () => {
  updateChart()
}, { deep: true })

defineExpose({
  chartInstance,
  downloadImage,
  resize: () => chartInstance?.resize()
})
</script>

<style scoped>
.daily-stats-chart {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}
</style>