<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    <HistoryChart />
    <EnergyAverages />
    <PeakUsage />
  </div>
</template>

<script setup lang="ts">
import HistoryChart   from './sub-components/HistoryChart.vue'
import EnergyAverages from './sub-components/EnergyAverages.vue'
import PeakUsage      from './sub-components/PeakUsage.vue'
</script>