<template>
  <div class="chart-wrapper">
    <ClientOnly>
      <v-chart 
        class="echart-instance" 
        :option="chartOption" 
        autoresize 
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  xAxisData: string[]
  datasets: {
    name: string
    data: number[]
    color?: string
  }[]
  showZoom?: boolean
  showSmooth?: boolean
}>()

const chartOption = computed(() => {
  const seriesConfig = props.datasets.map(set => ({
    name: set.name,
    type: 'line',
    data: set.data,
    smooth: props.showSmooth ?? true,
    symbol: 'none',
    lineStyle: {
      width: 1.5,
      color: set.color
    },
    itemStyle: {
      color: set.color
    },
    // ลบ areaStyle ออกถาวรเพื่อให้ไม่มีแรงเงา
    areaStyle: undefined
  }))

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      textStyle: { color: '#1f2937', fontSize: 12 }
    },
    legend: {
      show: true,
      top: 0,
      icon: 'circle'
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: props.showZoom ? '15%' : '8%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: seriesConfig,
    dataZoom: props.showZoom ? [
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 5,
        borderColor: 'transparent',
        backgroundColor: '#f3f4f6',
        fillerColor: 'rgba(55, 138, 221, 0.15)',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
        handleSize: '120%',
        textStyle: { color: '#9ca3af' }
      },
      { type: 'inside' }
    ] : []
  }
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 320px;
}
.echart-instance {
  width: 100%;
  height: 100%;
}
</style>