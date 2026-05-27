<template>
  <div class="dashboard-page">
    <h2>ภาพรวมระบบไฟฟ้า (Real-time)</h2>
    <StatCards />
    <DeviceTable />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import StatCards from '~/components/Dashboard/StatCards.vue'
import DeviceTable from '~/components/Dashboard/DeviceTable.vue'
import { useDashboard } from '~/composables/useDashboard-1'

const { startPolling, stopPolling } = useDashboard()

onMounted(startPolling)
onUnmounted(stopPolling)
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.page-header h2 {
  margin: 0 0 8px 0;
  color: var(--color-text-1);
}
</style>