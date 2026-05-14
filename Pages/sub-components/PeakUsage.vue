<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-flame" /> ช่วงเวลา Peak สูงสุด</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div v-for="peak in peakHours" :key="peak.label"
        style="display:flex;align-items:center;gap:12px;font-size:13px"
      >
        <span style="width:80px;color:var(--color-text-2);font-family:var(--font-mono);font-size:12px">
          {{ peak.label }}
        </span>
        <div style="flex:1;height:8px;background:var(--color-bg);border-radius:4px;overflow:hidden">
          <div
            style="height:100%;border-radius:4px;transition:width 0.5s"
            :style="{ width: peak.pct+'%', background: peak.color }"
          />
        </div>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-text-1);min-width:55px;text-align:right">
          {{ peak.kw }} kW
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const peakHours = [
  { label: '08:00–10:00', kw: 42.1, pct: 84, color: '#E24B4A' },
  { label: '13:00–15:00', kw: 38.5, pct: 77, color: '#BA7517' },
  { label: '17:00–19:00', kw: 35.2, pct: 70, color: '#378ADD' },
  { label: '10:00–12:00', kw: 30.8, pct: 62, color: '#1D9E75' },
  { label: '20:00–22:00', kw: 22.4, pct: 45, color: '#9aa0b0' },
]
</script>