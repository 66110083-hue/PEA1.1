<script setup lang="ts">
defineProps<{
  criticalCount: number
}>()
</script>

<template>
  <div class="alerts-header">
    <div class="header-left">
      <i class="ti ti-bell bell-icon" />
      <span class="page-title">การแจ้งเตือน</span>
    </div>
    <div class="critical-badge">
      {{ criticalCount }} รายการวิกฤต
    </div>
  </div>
</template>

<style scoped>
.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bell-icon {
  font-size: 18px;
  color: #f59e0b;
}
.page-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -.3px;
  color: var(--color-text-1, #111827);
}
.critical-badge {
  background: #fef2f2;
  color: #dc2626;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #fecaca;
}
@media (max-width: 768px) {
  .alerts-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>