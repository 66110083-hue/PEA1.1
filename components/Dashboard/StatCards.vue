<template>
  <div class="stat-cards-container">
    <div class="card stat-card">
      <div class="stat-title">อุปกรณ์ออนไลน์</div>
      <div class="stat-value text-green">{{ onlineCount }} / {{ devices.length }}</div>
    </div>
    
    <div class="card stat-card">
      <div class="stat-title">การใช้พลังงานรวม</div>
      <div class="stat-value text-blue">{{ (totalPower / 1000).toFixed(2) }} kW</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ดึงข้อมูลมาจาก Logic กลาง โดยใช้ ~/ ป้องกันปัญหา Path
import { useDashboard } from '~/composables/useDashboard-1'
const { onlineCount, devices, totalPower } = useDashboard()
</script>

<style scoped>
.stat-cards-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-title { font-size: 14px; color: var(--color-text-2); margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; }
.text-green { color: #1D9E75; }
.text-blue { color: #378ADD; }
</style>