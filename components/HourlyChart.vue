<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-chart-bar" /> พลังงานรายชั่วโมง (kWh)</div>
      <div class="phase-tabs">
        <button v-for="t in phaseTabs" :key="t.key"
          class="ptab"
          :class="{ active: activePhase === t.key }"
          @click="switchPhase(t.key)"
        >{{ t.label }}</button>
      </div>
    </div>
    <div class="chart-wrap" style="height:200px">
      <canvas id="overviewChart" role="img" aria-label="กราฟพลังงานรายชั่วโมง" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMockData } from '~/composables/useMockData'
import { useChart, baseOpts } from '~/composables/useChart'

const { getHourlyData } = useMockData()
const activePhase = ref('all')
const hourly = ref(getHourlyData())

const phaseTabs = [
  { key: 'all', label: 'รวม' },
  { key: 'A',   label: 'เฟส A' },
  { key: 'B',   label: 'เฟส B' },
  { key: 'C',   label: 'เฟส C' },
]

const phaseColors: Record<string, string> = {
  all: 'rgba(29,158,117,0.65)',
  A:   'rgba(55,138,221,0.65)',
  B:   'rgba(29,158,117,0.65)',
  C:   'rgba(186,117,23,0.65)',
}

function getDataForPhase(ph: string) {
  const h = hourly.value
  if (ph === 'all') return h.A.map((v: number, i: number) => +(v + h.B[i] + h.C[i]).toFixed(1))
  return h[ph as 'A' | 'B' | 'C']
}

const { init: initChart, getInstance } = useChart('overviewChart', () => ({
  type: 'bar',
  data: {
    labels: hourly.value.labels,
    datasets: [{
      label: 'kWh',
      data: getDataForPhase('all'),
      backgroundColor: phaseColors.all,
      borderRadius: 4,
    }],
  },
  options: {
    ...baseOpts(),
    scales: {
      ...baseOpts().scales,
      x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, autoSkip: true, maxTicksLimit: 12 } },
    },
  },
}))

function switchPhase(ph: string) {
  activePhase.value = ph
  const chart = getInstance()
  if (!chart) return
  chart.data.datasets[0].data = getDataForPhase(ph)
  chart.data.datasets[0].backgroundColor = phaseColors[ph]
  chart.update()
}

let chartRefreshTimer: any
onMounted(async () => {
  await initChart()
  chartRefreshTimer = setInterval(() => {
    hourly.value = getHourlyData()
    switchPhase(activePhase.value)
  }, 10000)
})
onBeforeUnmount(() => clearInterval(chartRefreshTimer))
</script>