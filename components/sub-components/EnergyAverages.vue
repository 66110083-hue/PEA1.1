<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-calculator" /> ค่าเฉลี่ยการใช้พลังงาน</div>
    </div>
    <div class="avg-grid">
      <div class="avg-item">
        <div class="avg-num">{{ avgs.kwhPerDay.toFixed(1) }}</div>
        <div class="avg-lbl">kWh / วัน</div>
      </div>
      <div class="avg-item">
        <div class="avg-num">{{ avgs.kwhPerMonth.toLocaleString() }}</div>
        <div class="avg-lbl">kWh / เดือน</div>
      </div>
      <div class="avg-item">
        <div class="avg-num">{{ avgs.kwhPerYear.toLocaleString() }}</div>
        <div class="avg-lbl">kWh / ปี</div>
      </div>
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ avgs.costPerDay.toLocaleString() }}</div>
        <div class="avg-lbl">บาท / วัน</div>
      </div>
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ avgs.costPerMonth.toLocaleString() }}</div>
        <div class="avg-lbl">บาท / เดือน</div>
      </div>
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ avgs.costPerYear.toLocaleString() }}</div>
        <div class="avg-lbl">บาท / ปี</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMockData } from '~/composables/useMockData'

const { getAverages } = useMockData()
const avgs = getAverages()
</script>