<script setup lang="ts">
interface Props {
  label: string
  value: number
  min: number
  max: number
  unit: string
  size?: number
  sub?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 100,
})

function gaugeArc(value: number, min: number, max: number, size = 80) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  const startAngle = -210 * (Math.PI / 180)
  const sweepAngle = 240 * (Math.PI / 180)

  const endAngle = startAngle + sweepAngle * pct

  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)

  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)

  const large = sweepAngle * pct > Math.PI ? 1 : 0

  return {
    path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    pct,
  }
}

function gaugeBgArc(size = 80) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  const startAngle = -210 * (Math.PI / 180)
  const endAngle = startAngle + 240 * (Math.PI / 180)

  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)

  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)

  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
}

function gaugeColor(pct: number) {
  if (pct < 0.6) return '#1D9E75'
  if (pct < 0.85) return '#F59E0B'
  return '#EF4444'
}
</script>

<template>
  <div class="td-gauge-item">
    <svg :width="size" :height="size * 0.72" :viewBox="`0 0 ${size} ${size * 0.72}`">

      <path
        :d="gaugeBgArc(size)"
        fill="none"
        stroke="var(--color-border)"
        stroke-width="5"
        stroke-linecap="round"
      />

      <path
        :d="gaugeArc(value, min, max, size).path"
        fill="none"
        :stroke="gaugeColor(gaugeArc(value, min, max, size).pct)"
        stroke-width="5"
        stroke-linecap="round"
      />

      <circle
        :cx="size / 2"
        :cy="size * 0.72 * 0.8"
        r="3"
        fill="var(--color-text-2)"
      />
    </svg>

    <span class="td-gauge-value">
      {{ value.toFixed(3) }}
    </span>

    <span class="td-gauge-label">
      {{ label }}
    </span>

    <span v-if="sub" class="td-gauge-sub">
      ↑ {{ sub }}
    </span>
  </div>
</template>

<style scoped>
.td-gauge-item {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:4px;
  padding:10px 8px;
  background:var(--color-surface-2);
  border:1px solid var(--color-border);
  border-radius:8px;
}

.td-gauge-label {
  font-size:9px;
  color:var(--color-text-3);
  text-align:center;
  text-transform:uppercase;
  letter-spacing:0.04em;
  line-height:1.3;
}

.td-gauge-value {
  font-size:13px;
  font-weight:700;
  font-family:var(--font-mono);
}

.td-gauge-sub {
  font-size:9px;
  color:var(--color-text-3);
}
</style>