<script setup lang="ts">
import type { Series } from '@/composables/useAnalysisChart'

defineProps<{ series: Series[] }>()
</script>

<template>
  <div class="legend">
    <div v-for="s in series" :key="s.key" class="legend-item">
      <span class="legend-dot" :style="{ background: s.color }"></span>
      <span class="legend-label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display:   flex;
  flex-wrap: wrap;
  gap:       14px;
  row-gap:   8px;
}
.legend-item {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   11px;
  color:       var(--color-text-2, #6b7280);
}
.legend-dot {
  width:        8px;
  height:       8px;
  border-radius: 50%;
  flex-shrink:  0;
}
.legend-label { line-height: 1.3; }
</style>