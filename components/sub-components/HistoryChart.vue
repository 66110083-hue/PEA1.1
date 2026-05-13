<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-history" /> ข้อมูลย้อนหลัง</div>
      <div class="period-tabs">
        <button
          v-for="p in periods" :key="p.key"
          class="period-tab"
          :class="{ active: period === p.key }"
          @click="switchPeriod(p.key)"
        >{{ p.label }}</button>
      </div>
    </div>
    <div class="chart-wrap" style="height:240px">
      <canvas id="histChart" role="img" aria-label="กราฟข้อมูลย้อนหลัง" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMockData } from '~/composables/useMockData'
import { useChart, baseOpts } from '~/composables/useChart'

const { getHistoryData } = useMockData()
const period = ref<'day' | 'month' | 'year'>('day')

const periods = [
  { key: 'day'   as const, label: 'รายวัน' },
  { key: 'month' as const, label: 'รายเดือน' },
  { key: 'year'  as const, label: 'รายปี' },
]

const { init, getInstance } = useChart('histChart', () => buildConfig())

function buildConfig() {
  const d = getHistoryData(period.value)
  return {
    type: 'bar' as const,
    data: {
      labels: d.labels,
      datasets: [
        {
          label: d.unit,
          data: d.data,
          backgroundColor: 'rgba(55,138,221,0.55)',
          borderRadius: 4,
        },
        {
          label: 'ค่าเฉลี่ย',
          data: d.labels.map(() => d.avg),
          type: 'line' as const,
          borderColor: '#E24B4A',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...baseOpts(),
      scales: {
        x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, autoSkip: true, maxTicksLimit: 12 } },
        y: baseOpts().scales.y,
      },
    },
  }
}

function switchPeriod(p: 'day' | 'month' | 'year') {
  period.value = p
  const chart = getInstance()
  if (!chart) return
  chart.data = buildConfig().data
  chart.update()
}

onMounted(() => init())
</script>