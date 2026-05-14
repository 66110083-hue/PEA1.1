<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-trending-down" /> การลดพลังงาน (Peak Shaving)</div>
    </div>
    <div class="avg-grid">
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ be.peakShavingKw }}</div>
        <div class="avg-lbl">kW ลดได้</div>
      </div>
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ be.peakShavingPct }}%</div>
        <div class="avg-lbl">ลดการใช้ Peak</div>
      </div>
      <div class="avg-item">
        <div class="avg-num" style="color:var(--color-green)">{{ be.peakShavingSaving.toLocaleString() }}</div>
        <div class="avg-lbl">บาท/เดือน ประหยัดเพิ่ม</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  be: ReturnType<any>
}>()
</script>