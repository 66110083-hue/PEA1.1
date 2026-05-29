<script setup lang="ts">
import type { Series, ChartPoint } from '@/composables/useAnalysisChart'
import { CW, CH, MINI_H, PAD } from '@/composables/useAnalysisChart'

// ── Props ──────────────────────────────────────────────────
const props = defineProps<{
  series:    Series[]
  chartData: ChartPoint[]
}>()

// ── SVG helpers (local, use props.chartData) ───────────────
function minMax(key: string) {
  const vals = props.chartData.map(p => p[key] as number).filter(v => !isNaN(v))
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  return { min, max: max === min ? max + 1 : max }
}

function toX(i: number) {
  return PAD.left + (i / (props.chartData.length - 1)) * (CW - PAD.left - PAD.right)
}

function toY(val: number, min: number, max: number) {
  return PAD.top + (1 - (val - min) / (max - min)) * (CH - PAD.top - PAD.bottom)
}

function linePath(key: string) {
  const { min, max } = minMax(key)
  return props.chartData
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p[key] as number, min, max).toFixed(1)}`)
    .join(' ')
}

function areaPath(key: string) {
  const { min, max } = minMax(key)
  const bottom = CH - PAD.bottom
  const pts    = props.chartData
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p[key] as number, min, max).toFixed(1)}`)
    .join(' ')
  const last = toX(props.chartData.length - 1)
  return `${pts} L${last.toFixed(1)},${bottom} L${toX(0).toFixed(1)},${bottom} Z`
}

function xLabels() {
  const step = Math.max(1, Math.floor(props.chartData.length / 8))
  return props.chartData
    .filter((_, i) => i % step === 0)
    .map((p, idx) => ({ x: toX(idx * step), label: p.time as string }))
}

function yLabels(key: string, steps = 4) {
  const { min, max } = minMax(key)
  return Array.from({ length: steps + 1 }, (_, i) => {
    const val = min + ((max - min) / steps) * i
    return { y: toY(val, min, max), label: val.toFixed(1) }
  })
}

function miniPath(key: string) {
  const { min, max } = minMax(key)
  const sPad = { top: 4, bottom: 4 }
  const toMY = (v: number) =>
    sPad.top + (1 - (v - min) / (max - min)) * (MINI_H - sPad.top - sPad.bottom)
  return props.chartData
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toMY(p[key] as number).toFixed(1)}`)
    .join(' ')
}
</script>

<template>
  <!-- Main line chart -->
  <div class="svg-wrap">
    <svg :viewBox="`0 0 ${CW} ${CH}`" class="svg" preserveAspectRatio="none">

      <!-- Grid + Y labels -->
      <g v-for="yl in yLabels(series[0].key)" :key="`g-${yl.label}`">
        <line
          :x1="PAD.left" :y1="yl.y" :x2="CW - PAD.right" :y2="yl.y"
          stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4 4"
        />
        <text :x="PAD.left - 5" :y="yl.y + 4"
          text-anchor="end" font-size="9" fill="#9ca3af">
          {{ yl.label }}
        </text>
      </g>

      <!-- Area fill for first series -->
      <path
        :d="areaPath(series[0].key)"
        :fill="series[0].color"
        fill-opacity="0.07"
      />

      <!-- Lines -->
      <path
        v-for="s in series" :key="s.key"
        :d="linePath(s.key)"
        :stroke="s.color"
        stroke-width="1.5"
        fill="none"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- X labels -->
      <text
        v-for="xl in xLabels()" :key="`x-${xl.label}`"
        :x="xl.x" :y="CH - 6"
        text-anchor="middle" font-size="8" fill="#9ca3af"
      >{{ xl.label }}</text>

    </svg>
  </div>

  <!-- Mini sparkline -->
  <div class="svg-wrap svg-mini">
    <svg :viewBox="`0 0 ${CW} ${MINI_H}`" class="svg" preserveAspectRatio="none">
      <path
        v-for="s in series" :key="s.key"
        :d="miniPath(s.key)"
        :stroke="s.color"
        stroke-width="1"
        fill="none"
        opacity="0.7"
      />
    </svg>
  </div>
</template>

<style scoped>
.svg-wrap {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border: 1px solid var(--color-border, #f3f4f6);
  border-radius: 8px;
  background: var(--color-bg, #fafafa);
}
.svg-mini { height: 56px; }
.svg      { width: 100%; height: 100%; display: block; }
</style>