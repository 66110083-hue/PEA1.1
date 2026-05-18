<script setup lang="ts">
import TransformerGaugeItem from './TransformerGaugeItem.vue'

defineProps<{
  gauges: any[]
}>()
</script>

<template>
  <div class="td-gauges-grid">
    <TransformerGaugeItem
      v-for="g in gauges"
      :key="g.label"
      v-bind="g"
    />
  </div>
</template>

<style scoped>
.td-gauges-grid {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap:12px;
}
</style>