<script setup lang="ts">
import { computed } from 'vue'

// ── Props ──────────────────────────────────────────────────
const props = defineProps<{
  xAxisData:  string[]
  datasets:   { name: string; data: number[]; color?: string; showArea?: boolean }[]
  showZoom?:  boolean
  showSmooth?: boolean
}>()

// ── ECharts option ─────────────────────────────────────────
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textStyle: { color: '#1f2937', fontSize: 12 },
    axisPointer: {
      type: 'cross',
      label: { backgroundColor: '#6b7280' },
      crossStyle: { color: '#d1d5db' },
    },
  },

  // legend ปิดไว้ เพราะใช้ AnalysisChartLegend.vue แทน
  legend: { show: false },

  grid: {
    left:         '1%',
    right:        '2%',
    bottom:       props.showZoom ? '15%' : '6%',
    top:          '6%',
    containLabel: true,
  },

  xAxis: {
    type:      'category',
    data:      props.xAxisData,
    axisLine:  { lineStyle: { color: '#d1d5db' } },
    axisTick:  { show: false },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    boundaryGap: false,
  },

  yAxis: {
    type:      'value',
    axisLine:  { show: false },
    axisTick:  { show: false },
    splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
  },

  dataZoom: props.showZoom
    ? [
        {
          type:            'slider',
          start:           0,
          end:             100,
          height:          20,
          bottom:          4,
          borderColor:     'transparent',
          backgroundColor: '#f3f4f6',
          fillerColor:     'rgba(29, 158, 117, 0.12)',
          handleStyle:     { color: '#1D9E75', borderColor: '#1D9E75' },
          textStyle:       { color: '#9ca3af', fontSize: 10 },
          moveHandleSize:  0,
        },
        { type: 'inside' },
      ]
    : [],

  series: props.datasets.map(s => ({
    name:        s.name,
    type:        'line',
    data:        s.data,
    smooth:      props.showSmooth ?? true,
    symbol:      'none',
    lineStyle:   { width: 1.5, color: s.color },
    itemStyle:   { color: s.color },
    areaStyle:   s.showArea
      ? {
          color: {
            type:       'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0,   color: (s.color ?? '#10B981') + '22' },
              { offset: 1,   color: (s.color ?? '#10B981') + '00' },
            ],
          },
        }
      : undefined,
  })),
}))
</script>

<template>
  <div class="line-chart-wrap">
    <v-chart class="echart" :option="chartOption" autoresize />
  </div>
</template>

<style scoped>
.line-chart-wrap {
  width:         100%;
  height:        300px;
  border:        1px solid var(--color-border, #f3f4f6);
  border-radius: 8px;
  background:    var(--color-surface, #fff);
  overflow:      hidden;
}
.echart {
  width:  100%;
  height: 100%;
}
</style>