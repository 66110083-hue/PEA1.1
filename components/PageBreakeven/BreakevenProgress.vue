<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-target" /> ความคืบหน้าจุดคุ้มทุน</div>
      <span style="font-size:12px;font-weight:500;color:var(--color-green)">
        ผ่านไปแล้ว {{ be.elapsedMonths }} เดือน จาก {{ be.months }} เดือน
      </span>
    </div>
    <div style="font-size:12px;color:var(--color-text-2);margin-bottom:8px">
      ต้นทุนติดตั้ง: {{ installCost.toLocaleString() }} บาท — คืนทุนแล้ว: {{ be.recovered.toLocaleString() }} บาท
      <strong style="color:var(--color-green)">({{ be.pct }}%)</strong>
    </div>
    <div class="be-bar">
      <div class="be-fill" :style="{ width: be.pct + '%' }" />
    </div>
    <div class="be-labels">
      <span>เริ่มต้น</span>
      <span>คุ้มทุน (เดือนที่ {{ be.months }})</span>
    </div>
    <div class="chart-wrap" style="height:200px;margin-top:16px">
      <canvas id="beChart" role="img" aria-label="กราฟการคืนทุน" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useChart, baseOpts } from '~/composables/useChart'

const props = defineProps<{
  be: ReturnType<any>
  installCost: number
}>()

const { init } = useChart('beChart', () => ({
  type: 'line' as const,
  data: {
    labels: props.be.chartLabels,
    datasets: [
      {
        label: 'ต้นทุน',
        data: props.be.costLine,
        borderColor: '#E24B4A',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'สะสมประหยัด',
        data: props.be.cumSavings,
        borderColor: '#1D9E75',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: 'rgba(29,158,117,0.08)',
      },
    ],
  },
  options: {
    ...baseOpts(),
    scales: {
      x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, maxTicksLimit: 12 } },
      y: {
        ...baseOpts().scales.y,
        ticks: { ...baseOpts().scales.y.ticks, callback: (v: any) => v.toLocaleString() + ' ฿' },
      },
    },
  },
}))

onMounted(() => init())
</script>