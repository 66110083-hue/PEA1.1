<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    <HistoryChart />
    <EnergyAverages />
    <PeakUsage />
  </div>
</template>

<script setup lang="ts">
import HistoryChart   from '~/components/PageHistory/HistoryChart.vue'
import EnergyAverages from '~/components/PageHistory/EnergyAverages.vue'
import PeakUsage      from '~/components/PageHistory/PeakUsage.vue'
</script>