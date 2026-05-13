<template>
  <div class="metric-grid">
    <div class="metric-card" style="--accent:#1D9E75">
      <div class="metric-label">พลังงานรวมวันนี้</div>
      <div class="metric-value">{{ metrics.energyToday.toFixed(1) }}</div>
      <div class="metric-unit">kWh</div>
      <div class="metric-trend trend-up"><i class="ti ti-trending-up" />&nbsp;+12.4% vs เมื่อวาน</div>
    </div>
    <div class="metric-card" style="--accent:#378ADD">
      <div class="metric-label">กำลังไฟฟ้ารวม</div>
      <div class="metric-value">{{ metrics.power }}</div>
      <div class="metric-unit">kW</div>
      <div class="metric-trend trend-up"><i class="ti ti-trending-up" />&nbsp;+5.1%</div>
    </div>
    <div class="metric-card" style="--accent:#BA7517">
      <div class="metric-label">Power Factor</div>
      <div class="metric-value">{{ metrics.pf }}</div>
      <div class="metric-unit">เป้าหมาย ≥ 0.90</div>
      <div class="metric-trend" :class="metrics.pf >= 0.9 ? 'trend-up' : 'trend-down'">
        <i :class="`ti ${metrics.pf >= 0.9 ? 'ti-check' : 'ti-alert-triangle'}`" />
        &nbsp;{{ metrics.pf >= 0.9 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์' }}
      </div>
    </div>
    <div class="metric-card" style="--accent:#E24B4A">
      <div class="metric-label">ค่าไฟสะสม/เดือน</div>
      <div class="metric-value">{{ metrics.costMonth.toLocaleString() }}</div>
      <div class="metric-unit">บาท</div>
      <div class="metric-trend trend-down"><i class="ti ti-trending-up" />&nbsp;+8.2% vs เดือนก่อน</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ metrics: ReturnType<any> }>()
</script>
