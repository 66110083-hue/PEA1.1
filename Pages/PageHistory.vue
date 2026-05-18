<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    <HistoryChart />
    <EnergyAverages />
    <PeakUsage />
  </div>
</template>

<script setup lang="ts">
import HistoryChart   from '~/components/HistoryChart.vue'
import EnergyAverages from '~/components/EnergyAverages.vue'
import PeakUsage      from '~/components/PeakUsage.vue'
</script>