<template>
  <div class="metric-grid">
    <div class="metric-card" style="--accent:#9aa0b0">
      <div class="metric-label">ค่าไฟก่อนติดตั้ง</div>
      <div class="metric-value">{{ be.beforeCost.toLocaleString() }}</div>
      <div class="metric-unit">บาท / เดือน</div>
    </div>
    <div class="metric-card" style="--accent:#1D9E75">
      <div class="metric-label">ค่าไฟหลังติดตั้ง</div>
      <div class="metric-value" style="color:var(--color-green)">{{ be.afterCost.toLocaleString() }}</div>
      <div class="metric-unit">บาท / เดือน</div>
    </div>
    <div class="metric-card" style="--accent:#378ADD">
      <div class="metric-label">ประหยัดได้ / เดือน</div>
      <div class="metric-value" style="color:var(--color-blue)">{{ be.saving.toLocaleString() }}</div>
      <div class="metric-unit">บาท ({{ savingPct }}%)</div>
    </div>
    <div class="metric-card" style="--accent:#BA7517">
      <div class="metric-label">ระยะคืนทุน</div>
      <div class="metric-value" style="color:var(--color-amber)">{{ be.months }}</div>
      <div class="metric-unit">เดือน</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  be: ReturnType<any>
}>()

const savingPct = computed(() =>
  ((props.be.saving / props.be.beforeCost) * 100).toFixed(1)
)
</script>
