<script setup lang="ts">
import { useDashboard } from '~/composables/useDashboard-1'
const { devices } = useDashboard()
</script>

<template>
  <div class="card">
    <table class="sg-table">
      <thead>
        <tr>
          <th>ID</th><th>ชื่ออุปกรณ์</th><th>สถานะ</th><th>กำลังไฟ (W)</th><th>V / A</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in devices" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.name }}</td>
          <td :style="{ color: d.status === 'Online' ? '#1D9E75' : '#e11d48' }">● {{ d.status }}</td>
          <td>{{ d.power.toLocaleString() }}</td>
          <td>{{ d.voltage > 0 ? `${d.voltage}V / ${d.current}A` : '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.sg-table { width: 100%; border-collapse: collapse; }
.sg-table th { background: #f9fafb; padding: 12px; text-align: left; }
.sg-table td { padding: 12px; border-bottom: 1px solid #eee; }
</style>